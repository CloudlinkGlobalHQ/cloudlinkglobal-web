const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

let _getToken: (() => Promise<string | null>) | null = null

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn
}

async function headers(): Promise<Record<string, string>> {
  const token = _getToken ? await _getToken() : null
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request(path: string, opts: RequestInit = {}): Promise<any> {
  const h = await headers()
  const res = await fetch(`${BASE}${path}`, { headers: h, ...opts })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail))
  }
  return res.json()
}

export const getBase = () => BASE

// Core
export const getStats            = ()              => request('/stats')
export const getDemoSummary      = ()              => request('/demo_summary')
export const getActions          = (status?: string) => request(`/actions${status ? `?status=${status}` : ''}`)
export const getResources        = (provider?: string, resourceType?: string) => {
  const q = new URLSearchParams()
  if (provider) q.set('provider', provider)
  if (resourceType) q.set('resource_type', resourceType)
  return request(`/resources${q.toString() ? `?${q.toString()}` : ''}`)
}
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
export const getAuditLog    = (params: Record<string, string> = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/audit${q ? `?${q}` : ''}`)
}
export const getCostSummary = () => request('/cost-summary')
export const getMultiCloudSummary = () => request('/multi-cloud/summary')
export const ingestCloudCosts = (data: object) => request('/cloud-costs/ingest', { method: 'POST', body: JSON.stringify(data) })
export const getGovernanceSummary = () => request('/v1/governance')
export const getDriftSummary = () => request('/drift/summary')
export const getDeployRisk = (service: string) => request(`/deploy-risk/${encodeURIComponent(service)}`)
export const runAutofixRegression = (id: string, data: object) => request(`/autofix/regressions/${id}`, { method: 'POST', body: JSON.stringify(data) })

// Deploys
export const getDeploys       = (service?: string) => request(`/deploys${service ? `?service=${encodeURIComponent(service)}` : ''}`)
export const getDeploy        = (id: string)        => request(`/deploys/${id}`)
export const createDeploy     = (data: object)      => request('/deploys', { method: 'POST', body: JSON.stringify(data) })

// Regressions
export const getRegressions          = (status?: string) => request(`/regressions${status ? `?status=${status}` : ''}`)
export const acknowledgeRegression   = (id: string)      => request(`/regressions/${id}/acknowledge`, { method: 'POST' })
export const resolveRegression       = (id: string)      => request(`/regressions/${id}/resolve`,     { method: 'POST' })
export const runRegressionDetection  = ()                => request('/regression/run', { method: 'POST' })

// Slack settings
export const getSlackSettings  = ()             => request('/settings/slack')
export const updateSlackSettings = (data: object) => request('/settings/slack', { method: 'PUT', body: JSON.stringify(data) })
export const testSlackSettings = ()             => request('/settings/slack/test', { method: 'POST' })

// Cost Snapshots
export const getCostSnapshots        = (service?: string) => request(`/cost-snapshots${service ? `?service=${encodeURIComponent(service)}` : ''}`)
export const getTrackedServices      = ()                  => request('/cost-snapshots/services')

// Budget Guardrails
export const getBudgets       = ()             => request('/budgets')
export const createBudget     = (data: object) => request('/budgets', { method: 'POST', body: JSON.stringify(data) })
export const updateBudget     = (id: string, data: object) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteBudget     = (id: string)   => request(`/budgets/${id}`, { method: 'DELETE' })
export const getBudgetAlerts  = (budgetId?: string) => request(`/budgets/alerts${budgetId ? `?budget_id=${budgetId}` : ''}`)
export const checkBudgets     = ()             => request('/budgets/check', { method: 'POST' })

// Cost Estimation
export const estimateDeployCost = (data: object) => request('/cost-estimate', { method: 'POST', body: JSON.stringify(data) })

// Anomaly Detection
export const getAnomalies         = ()              => request('/anomalies')
export const analyzeServiceAnomaly = (service: string) => request(`/anomalies/${encodeURIComponent(service)}`)

// AutoStopping
export const getAutostopRules        = ()                          => request('/autostop/rules')
export const createAutostopRule      = (data: object)              => request('/autostop/rules', { method: 'POST', body: JSON.stringify(data) })
export const updateAutostopRule      = (id: string, data: object)  => request(`/autostop/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAutostopRule      = (id: string)                => request(`/autostop/rules/${id}`, { method: 'DELETE' })
export const getAutostopEvents       = (limit = 100)               => request(`/autostop/events?limit=${limit}`)
export const getAutostopSavings      = ()                          => request('/autostop/savings')
export const stopResource            = (id: string, data: object)  => request(`/autostop/resources/${encodeURIComponent(id)}/stop`, { method: 'POST', body: JSON.stringify(data) })
export const startResource           = (id: string, data: object)  => request(`/autostop/resources/${encodeURIComponent(id)}/start`, { method: 'POST', body: JSON.stringify(data) })
export const runAutostopNow          = ()                          => request('/autostop/run', { method: 'POST' })

// Unit Economics
export const getUnitEconomics = (days = 30) => request(`/unit-economics?days=${days}`)

// AI Cost Advisor
export const getAiAdvisor = () => request('/ai-advisor', { method: 'POST' })

// Email digest
export const sendWeeklyDigest = (data: { email: string; name?: string }) =>
  request('/emails/weekly-digest', { method: 'POST', body: JSON.stringify(data) })

// Reserved Instance recommendations
export const getRiRecommendations = () => request('/ri-recommendations')

// Cost Forecast
export const getCostForecast = (daysBack = 30, daysAhead = 30) =>
  request(`/cost-forecast?days_back=${daysBack}&days_ahead=${daysAhead}`)

// Tag-based cost allocation
export const getTagCosts = (tagKey = 'Environment') =>
  request(`/tag-costs?tag_key=${encodeURIComponent(tagKey)}`)

// Rightsizing
export const getRightsizing = (cpuThreshold = 20) => request(`/rightsizing?cpu_threshold=${cpuThreshold}`)

// Savings report
export const getSavingsReport = () => request('/savings-report')

// Anomaly alerts
export const runAnomalyAlerts = () => request('/anomaly-alerts/run', { method: 'POST' })

// Team members
export const getTeamMembers   = ()                         => request('/team/members')
export const inviteTeamMember = (data: object)             => request('/team/members', { method: 'POST', body: JSON.stringify(data) })
export const updateTeamMember = (id: string, data: object) => request(`/team/members/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const removeTeamMember = (id: string)               => request(`/team/members/${id}`, { method: 'DELETE' })

// Virtual Tags
export const getVirtualTags        = ()                          => request('/virtual-tags')
export const createVirtualTag      = (data: object)              => request('/virtual-tags', { method: 'POST', body: JSON.stringify(data) })
export const updateVirtualTag      = (id: string, data: object)  => request(`/virtual-tags/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteVirtualTag      = (id: string)                => request(`/virtual-tags/${id}`, { method: 'DELETE' })
export const getVirtualTagCosts    = (days = 30)                 => request(`/virtual-tags/costs/breakdown?days=${days}`)

// Kubernetes cost visibility
export const getK8sCosts           = (hoursBack = 168, cluster?: string) =>
  request(`/k8s/costs?hours_back=${hoursBack}${cluster ? `&cluster=${encodeURIComponent(cluster)}` : ''}`)
export const getK8sNamespaces      = (hoursBack = 168, cluster?: string) =>
  request(`/k8s/costs/namespaces?hours_back=${hoursBack}${cluster ? `&cluster=${encodeURIComponent(cluster)}` : ''}`)
export const getK8sPods            = (hoursBack = 24, namespace?: string) =>
  request(`/k8s/costs/pods?hours_back=${hoursBack}${namespace ? `&namespace=${encodeURIComponent(namespace)}` : ''}`)
export const ingestK8sCosts        = (data: object)              => request('/k8s/ingest', { method: 'POST', body: JSON.stringify(data) })

// Drift detection
export const getDriftBaselines     = ()                          => request('/drift/baselines')
export const createDriftBaseline   = (data: object)              => request('/drift/baselines', { method: 'POST', body: JSON.stringify(data) })
export const deleteDriftBaseline   = (id: string)                => request(`/drift/baselines/${id}`, { method: 'DELETE' })
export const runDriftScan          = ()                          => request('/drift/scan', { method: 'POST' })
export const getDriftEvents        = (params: Record<string, string> = {}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/drift/events${q ? `?${q}` : ''}`)
}
export const acknowledgeDriftEvent = (id: string)                => request(`/drift/events/${id}/acknowledge`, { method: 'POST' })

// Anomaly runbooks
export const getAnomalyRunbook     = (service: string)           => request(`/anomalies/${encodeURIComponent(service)}/runbook`, { method: 'POST' })

// Public API v1
export const getV1Costs            = (days = 30)                 => request(`/v1/costs?days=${days}`)
export const getV1Anomalies        = ()                          => request('/v1/anomalies')
export const getV1Savings          = ()                          => request('/v1/savings')

// API key management
export const getApiKeys            = ()                          => request('/api-keys')
export const createApiKey          = (data: object)              => request('/api-keys', { method: 'POST', body: JSON.stringify(data) })

// Savings Plans
export const analyzeSavingsPlans   = (data: object)              => request('/savings-plans/analyze', { method: 'POST', body: JSON.stringify(data) })
export const getSavingsPlansOptions = ()                         => request('/savings-plans/options')
export const getSavingsPlansCoverage = (days = 30)               => request(`/savings-plans/coverage?days=${days}`)

// SDK cost-per-customer
export const getSdkCostsByCustomer = (days = 30, feature?: string) =>
  request(`/sdk/costs/by-customer?days=${days}${feature ? `&feature=${encodeURIComponent(feature)}` : ''}`)
