const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents.onrender.com'

// Normal calls give up after 20 s. Render can take 30–60 s to wake from idle,
// so a timeout is reported as "the backend may be waking up" and the user retries.
export const DEFAULT_TIMEOUT_MS = 20_000
// A scan assumes a role and walks every region, so it gets longer.
export const SCAN_TIMEOUT_MS = 90_000
// How long a request waits for ClerkApiProvider to register the token getter.
const TOKEN_WAIT_MS = 10_000

export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server'
  | 'timeout'
  | 'network'
  | 'bad_request'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly detail?: string

  constructor(kind: ApiErrorKind, message: string, opts: { status?: number; detail?: string } = {}) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = opts.status
    this.detail = opts.detail
  }

  /** The backend refused because CLOUDLINK_READ_ONLY is on. */
  get readOnly(): boolean {
    return this.kind === 'forbidden' && /read-only/i.test(this.detail || '')
  }
}

export function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 408) return 'timeout'
  if (status >= 500) return 'server'
  return 'bad_request'
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof Error) return new ApiError('network', err.message)
  return new ApiError('network', String(err))
}

let _getToken: (() => Promise<string | null>) | null = null
let _tokenReady: () => void = () => {}
let tokenReady = new Promise<void>((resolve) => { _tokenReady = resolve })

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn
  _tokenReady()
}

/** Test helper: forget the token getter so the next request waits again. */
export function resetTokenGetter() {
  _getToken = null
  tokenReady = new Promise<void>((resolve) => { _tokenReady = resolve })
}

async function authHeaders(): Promise<Record<string, string>> {
  // Pages fetch on mount; make sure the Clerk token getter is registered first
  // so the first request after a hard load is not sent without a token.
  if (!_getToken) {
    await Promise.race([tokenReady, new Promise((r) => setTimeout(r, TOKEN_WAIT_MS))])
  }
  const token = _getToken ? await _getToken().catch(() => null) : null
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function detailOf(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const b = body as { detail?: unknown; error?: unknown; message?: unknown }
    for (const v of [b.detail, b.error, b.message]) {
      if (typeof v === 'string' && v) return v
      if (Array.isArray(v) && v.length) {
        const first = v[0] as { msg?: unknown }
        return typeof first?.msg === 'string' ? first.msg : JSON.stringify(v)
      }
    }
  }
  return fallback
}

type RequestOpts = RequestInit & { timeoutMs?: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request(path: string, opts: RequestOpts = {}): Promise<any> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = opts
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)
  try {
    const headers = { ...(await authHeaders()), ...((init.headers as Record<string, string>) || {}) }
    let res: Response
    try {
      res = await fetch(`${BASE}${path}`, { ...init, headers, signal: controller.signal })
    } catch (e) {
      if (timedOut) throw new ApiError('timeout', `Request to ${path} timed out after ${Math.round(timeoutMs / 1000)} s`)
      throw new ApiError('network', e instanceof Error ? e.message : 'Network request failed')
    }
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const detail = detailOf(body, res.statusText || `HTTP ${res.status}`)
      throw new ApiError(kindForStatus(res.status), detail, { status: res.status, detail })
    }
    try {
      return await res.json()
    } catch {
      if (timedOut) throw new ApiError('timeout', `Request to ${path} timed out after ${Math.round(timeoutMs / 1000)} s`)
      throw new ApiError('server', 'The backend sent a response that could not be read')
    }
  } finally {
    clearTimeout(timer)
  }
}

export const getBase = () => BASE

// Core
export const getStats       = () => request('/stats')
export const getResources   = (resourceType?: string) =>
  request(`/resources${resourceType ? `?resource_type=${encodeURIComponent(resourceType)}` : ''}`)
export const getCostSummary = () => request('/cost-summary')

// Scans
export const scanNow  = () => request('/scan', { method: 'POST', timeoutMs: SCAN_TIMEOUT_MS })
export const getScans = (limit = 50) => request(`/scans?limit=${limit}`)

// Credentials
export const getCredentials   = ()             => request('/credentials')
export const addCredential    = (data: object) => request('/credentials', { method: 'POST', body: JSON.stringify(data) })
export const verifyCredential = (id: string)   => request(`/credentials/${id}/verify`, { method: 'POST', timeoutMs: 45_000 })
export const deleteCredential = (id: string)   => request(`/credentials/${id}`, { method: 'DELETE' })

// Webhooks
export const getWebhooks   = ()             => request('/webhooks')
export const addWebhook    = (data: object) => request('/webhooks', { method: 'POST', body: JSON.stringify(data) })
export const deleteWebhook = (id: string)   => request(`/webhooks/${id}`, { method: 'DELETE' })
export const testWebhooks  = ()             => request('/webhooks/test', { method: 'POST' })

// Slack settings
export const getSlackSettings    = ()             => request('/settings/slack')
export const updateSlackSettings = (data: object) => request('/settings/slack', { method: 'PUT', body: JSON.stringify(data) })
export const testSlackSettings   = ()             => request('/settings/slack/test', { method: 'POST' })

// Recommendations computed from scan data
export const getRiRecommendations = () => request('/ri-recommendations')
export const getRightsizing = (cpuThreshold = 20) => request(`/rightsizing?cpu_threshold=${cpuThreshold}`)
