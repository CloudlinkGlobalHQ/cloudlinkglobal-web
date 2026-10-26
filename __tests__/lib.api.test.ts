import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setTokenGetter, resetTokenGetter, getBase, getStats, scanNow, ApiError, request } from '../app/lib/api'
import { describeError, READ_ONLY_TITLE, WAKING_UP_HINT } from '../app/lib/errors'
import { summarizeScan } from '../app/lib/scan'
import { findingsOf } from '../app/lib/resources'

// ── helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    statusText: status === 200 ? 'OK' : 'Error',
  })
}

async function errorFor(status: number, body: unknown): Promise<ApiError> {
  vi.stubGlobal('fetch', mockFetch(status, body))
  try {
    await getStats()
  } catch (e) {
    return e as ApiError
  }
  throw new Error('expected getStats() to reject')
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('lib/api – getBase', () => {
  it('returns the default API URL when env var is not set', () => {
    expect(getBase()).toMatch(/cloudlink-agents\.onrender\.com|^https?:\/\//)
  })
})

describe('lib/api – auth header', () => {
  beforeEach(() => setTokenGetter(async () => null))
  afterEach(() => vi.unstubAllGlobals())

  it('attaches Authorization when a token is provided', async () => {
    setTokenGetter(async () => 'test-token-abc')
    const spy = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', spy)
    await getStats()
    const [, opts] = spy.mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer test-token-abc' })
  })

  it('omits Authorization when there is no token', async () => {
    const spy = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', spy)
    await getStats()
    const [, opts] = spy.mock.calls[0]
    expect((opts as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  it('waits for the token getter before the first request', async () => {
    resetTokenGetter()
    const spy = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', spy)
    const pending = getStats()
    await new Promise((r) => setTimeout(r, 20))
    expect(spy).not.toHaveBeenCalled()
    setTokenGetter(async () => 'late-token')
    await pending
    expect((spy.mock.calls[0][1] as RequestInit).headers).toMatchObject({ Authorization: 'Bearer late-token' })
  })
})

describe('lib/api – typed errors', () => {
  beforeEach(() => setTokenGetter(async () => 'tok'))
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [500, 'server'],
    [502, 'server'],
    [422, 'bad_request'],
    [429, 'bad_request'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    const err = await errorFor(status, { detail: 'nope' })
    expect(err).toBeInstanceOf(ApiError)
    expect(err.kind).toBe(kind)
    expect(err.status).toBe(status)
  })

  it('recognises the backend read-only 403', async () => {
    const err = await errorFor(403, { detail: 'Cloudlink is running in read-only mode and never changes resources in your cloud account.' })
    expect(err.readOnly).toBe(true)
    expect(describeError(err).title).toBe(READ_ONLY_TITLE)
  })

  it('reads slowapi {error} bodies and FastAPI validation lists', async () => {
    expect((await errorFor(429, { error: 'Rate limit exceeded: 5 per 1 minute' })).message).toBe('Rate limit exceeded: 5 per 1 minute')
    expect((await errorFor(422, { detail: [{ msg: 'field required' }] })).message).toBe('field required')
  })

  it('reports a network failure as kind "network"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(getStats()).rejects.toMatchObject({ kind: 'network' })
  })
})

describe('lib/api – timeout', () => {
  beforeEach(() => setTokenGetter(async () => 'tok'))
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  function hangingFetch() {
    return vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    }))
  }

  it('aborts after the timeout and says the backend may be waking up', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', hangingFetch())
    const p = request('/stats', { timeoutMs: 1000 })
    const assertion = expect(p).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(1001)
    await assertion
    const err = await p.catch((e) => e as ApiError)
    expect(describeError(err).hint).toBe(WAKING_UP_HINT)
  })

  it('uses a 20 s default and a longer timeout for scans', async () => {
    vi.useFakeTimers()
    const spy = hangingFetch()
    vi.stubGlobal('fetch', spy)
    const stats = getStats().catch((e) => e)
    const scan = scanNow().catch((e) => e)
    await vi.advanceTimersByTimeAsync(20_001)
    expect(await stats).toMatchObject({ kind: 'timeout' })
    let scanSettled = false
    void scan.then(() => { scanSettled = true })
    await vi.advanceTimersByTimeAsync(1)
    expect(scanSettled).toBe(false)
    await vi.advanceTimersByTimeAsync(70_000)
    expect(await scan).toMatchObject({ kind: 'timeout' })
  })
})

describe('lib/scan – summarizeScan', () => {
  it('asks for credentials when the backend has none', () => {
    expect(summarizeScan({ message: 'No credentials configured. Add one in the Credentials tab.', scans: [] }).status).toBe('needs_credentials')
  })
  it('reports a queued scan as queued, not "0 found"', () => {
    expect(summarizeScan({ queued: true, message: 'Scan queued for worker execution.' }).status).toBe('queued')
  })
  it('counts found items on success', () => {
    const s = summarizeScan({ credentials_scanned: 1, total_events_found: 7, scans: [{ status: 'finished' }] })
    expect(s).toEqual({ status: 'success', message: 'Scan finished: 7 items found.' })
  })
  it('reports a failed scan as an error', () => {
    const s = summarizeScan({ credentials_scanned: 1, total_events_found: 0, scans: [{ status: 'error', error: 'AccessDenied' }] })
    expect(s.status).toBe('error')
    expect(s.message).toContain('AccessDenied')
  })
})

describe('lib/resources – findingsOf', () => {
  it('flags idle EC2, unattached EBS and open security groups', () => {
    expect(findingsOf({ resource_id: 'i-1', resource_type: 'ec2_instance', payload: { is_idle: true, avg_cpu_7d: 1.2 } })).toEqual(['Idle — avg CPU 1.2% over 7 days'])
    expect(findingsOf({ resource_id: 'vol-1', resource_type: 'ebs_volume', payload: { issues: ['unattached'] } })).toEqual(['Unattached volume'])
    expect(findingsOf({ resource_id: 'sg-1', resource_type: 'security_group', payload: { open_ports: [{ port: 22, label: 'SSH' }] } })).toEqual(['Open to the internet: SSH'])
  })
  it('never flags the monthly cost record', () => {
    expect(findingsOf({ resource_id: 'aws-cost-2026-10', resource_type: 'aws_cost', payload: { issues: ['x'] } })).toEqual([])
  })
})
