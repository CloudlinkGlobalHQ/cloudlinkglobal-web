const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

function key(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('cl_api_key') || ''
}

function headers(): Record<string, string> {
  return { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' }
}

async function request(path: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...opts })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail))
  }
  return res.json()
}

export const setKey = (k: string) => localStorage.setItem('cl_api_key', k)
export const getKey = key
export const getBase = () => BASE

// Core
export const getStats            = ()              => request('/stats')
export const getDemoSummary      = ()              => request('/demo_summary')
export const getActions          = (status?: string) => request(`/actions${status ? `?status=${status}` : ''}`)
export const getResources        = ()              => request('/resources')
export const getRuns             = ()              => request('/runs')
export const getCredentials      = ()              => request('/credentials')
export const getApprovalPolicies = ()              => request('/approval-policies')

// Actions
export const approveAction = (id: string) => request(`/actions/${id}/approve`, { method: 'POST' })
export const rejectAction  = (id: string) => request(`/actions/${id}/reject`,  { method: 'POST' })
export const retryAction   = (id: string) => request(`/actions/${id}/retry`,   { method: 'POST' })
export const getActionResults = (id: string) => request(`/actions/${id}/results`)

// Run loop
export const runOnce = () => request('/run_once', { method: 'POST' })

// Scan
export const scanNow = () => request('/scan', { method: 'POST' })
export const getScans = (limit = 50) => request(`/scans?limit=${limit}`)

// Credentials
export const addCredential    = (data: object) => request('/credentials', { method: 'POST', body: JSON.stringify(data) })
export const verifyCredential = (id: string)   => request(`/credentials/${id}/verify`, { method: 'POST' })
export const deleteCredential = (id: string)   => request(`/credentials/${id}`, { method: 'DELETE' })

// Approval policies
export const setApprovalPolicy = (actionType: string, data: object) =>
  request(`/approval-policies/${actionType}`, { method: 'PUT', body: JSON.stringify(data) })

// Webhooks
export const getWebhooks  = ()              => request('/webhooks')
export const addWebhook   = (data: object)  => request('/webhooks', { method: 'POST', body: JSON.stringify(data) })
export const deleteWebhook = (id: string)   => request(`/webhooks/${id}`, { method: 'DELETE' })
export const testWebhooks = ()              => request('/webhooks/test', { method: 'POST' })

// Audit + Cost
export const getAuditLog    = (params: Record<string, any> = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/audit${q ? `?${q}` : ''}`)
}
export const getCostSummary = () => request('/cost-summary')

// Deploys
export const getDeploys       = (service?: string) => request(`/deploys${service ? `?service=${encodeURIComponent(service)}` : ''}`)
export const getDeploy        = (id: string)        => request(`/deploys/${id}`)
export const createDeploy     = (data: object)      => request('/deploys', { method: 'POST', body: JSON.stringify(data) })

// Regressions
export const getRegressions          = (status?: string) => request(`/regressions${status ? `?status=${status}` : ''}`)
export const acknowledgeRegression   = (id: string)      => request(`/regressions/${id}/acknowledge`, { method: 'POST' })
export const resolveRegression       = (id: string)      => request(`/regressions/${id}/resolve`,     { method: 'POST' })
export const runRegressionDetection  = ()                => request('/regression/run', { method: 'POST' })

// Cost Snapshots
export const getCostSnapshots        = (service?: string) => request(`/cost-snapshots${service ? `?service=${encodeURIComponent(service)}` : ''}`)
export const getTrackedServices      = ()                  => request('/cost-snapshots/services')
