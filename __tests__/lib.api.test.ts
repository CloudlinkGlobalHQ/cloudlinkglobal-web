import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setTokenGetter, getBase } from '../app/lib/api'

// ── helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    statusText: status === 200 ? 'OK' : 'Error',
  })
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('lib/api – getBase', () => {
  it('returns the default API URL when env var is not set', () => {
    const base = getBase()
    expect(base).toMatch(/cloudlink-agents-production\.up\.railway\.app|^https?:\/\//)
  })
})

describe('lib/api – setTokenGetter', () => {
  beforeEach(() => {
    setTokenGetter(async () => null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches Authorization header when a token is provided', async () => {
    setTokenGetter(async () => 'test-token-abc')
    const spy = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', spy)

    // Import lazily so module-level state picks up the token getter
    const { getStats } = await import('../app/lib/api')
    await getStats()

    const [, opts] = spy.mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-token-abc',
    })
  })

  it('sends an empty Authorization header when no token', async () => {
    setTokenGetter(async () => null)
    const spy = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', spy)

    const { getStats } = await import('../app/lib/api')
    await getStats()

    const [, opts] = spy.mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: '',
    })
  })

  it('throws when the API returns a non-2xx status', async () => {
    setTokenGetter(async () => null)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ detail: 'Forbidden' }),
      }),
    )

    const { getStats } = await import('../app/lib/api')
    await expect(getStats()).rejects.toThrow('Forbidden')
  })

  it('throws with a stringified detail when detail is an object', async () => {
    setTokenGetter(async () => null)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable',
        json: () => Promise.resolve({ detail: [{ msg: 'field required' }] }),
      }),
    )

    const { getStats } = await import('../app/lib/api')
    await expect(getStats()).rejects.toThrow()
  })
})

describe('lib/api – getDriftEvents', () => {
  afterEach(() => vi.restoreAllMocks())

  it('appends query params when provided', async () => {
    const spy = mockFetch(200, [])
    vi.stubGlobal('fetch', spy)

    const { getDriftEvents } = await import('../app/lib/api')
    await getDriftEvents({ limit: '50', status: 'open' })

    const [url] = spy.mock.calls[0]
    expect(url).toContain('limit=50')
    expect(url).toContain('status=open')
  })

  it('calls /drift/events with no query string when params is empty', async () => {
    const spy = mockFetch(200, [])
    vi.stubGlobal('fetch', spy)

    const { getDriftEvents } = await import('../app/lib/api')
    await getDriftEvents()

    const [url] = spy.mock.calls[0]
    expect(url).toMatch(/\/drift\/events$/)
  })
})
