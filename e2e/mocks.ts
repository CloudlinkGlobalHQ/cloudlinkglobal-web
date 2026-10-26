import type { Page, Route } from '@playwright/test'

// Responses shaped like cloudlink-agents api/app.py. Anything not listed here
// returns FastAPI's 404 {"detail": "Not Found"}.
export const API = 'http://mock-api.test'

const emptyTenant: Record<string, unknown> = {
  'GET /stats': { tenant_id: 't_new', actions_by_status: {}, execution_results_count: 0, resources_count: 0, last_scan: null },
  'GET /cost-summary': { tenant_id: 't_new', total_mtd_usd: 0, above_threshold: false, credential_count: 0, top_services: {}, connected_clouds: [], providers: [] },
  'GET /credentials': { items: [] },
  'GET /resources': { items: [] },
  'GET /scans': { items: [] },
  'GET /webhooks': { items: [] },
  'GET /settings/slack': { slack_webhook_url: '', enabled: false },
  'GET /rightsizing': {
    tenant_id: 't_new', cpu_threshold_pct: 20, ec2_total: 0, candidates: 0, total_current_monthly_usd: 0,
    total_rightsized_monthly_usd: 0, total_monthly_savings_usd: 0, total_annual_savings_usd: 0, recommendations: [],
  },
  'GET /ri-recommendations': {
    tenant_id: 't_new', ec2_total: 0, ec2_analyzed: 0, total_monthly_ondemand_usd: 0, total_monthly_if_all_ri_1yr_usd: 0,
    total_monthly_savings_1yr_usd: 0, total_annual_savings_1yr_usd: 0, total_annual_savings_3yr_usd: 0, recommendations: [],
    note: 'Pricing based on approximate us-east-1 on-demand rates.',
  },
  'POST /scan': { ok: true, message: 'No credentials configured. Add one in the Credentials tab.', scans: [] },
}

const now = '2026-10-25T15:00:00+00:00'
const topServices = { 'Amazon Elastic Compute Cloud - Compute': 612.41, 'Amazon Relational Database Service': 301.22, 'Amazon Simple Storage Service': 88.13 }
const scannedTenant: Record<string, unknown> = {
  ...emptyTenant,
  'GET /stats': {
    tenant_id: 't_demo', actions_by_status: {}, execution_results_count: 0, resources_count: 4,
    last_scan: { scan_id: 'scan_01', credential_label: 'Production', status: 'finished', started_at: now, finished_at: now, regions: ['us-east-1'], events_found: 4 },
  },
  'GET /cost-summary': { tenant_id: 't_demo', total_mtd_usd: 1243.57, above_threshold: false, credential_count: 1, top_services: topServices, connected_clouds: ['aws'], providers: [] },
  'GET /credentials': { items: [{ credential_id: 'cred_01', cloud: 'aws', credential_type: 'iam_role', label: 'Production', created_at: now, last_verified_at: now }] },
  'GET /resources': {
    items: [
      { resource_id: 'i-0a1b2c3d4e5f60718', resource_type: 'ec2_instance', provider: 'aws', region: 'us-east-1', payload: { name: 'staging-worker', instance_type: 't3.large', state: 'running', avg_cpu_7d: 1.8, is_idle: true } },
      { resource_id: 'vol-0f9e8d7c6b5a43210', resource_type: 'ebs_volume', provider: 'aws', region: 'us-east-1', payload: { name: 'old-data', size_gb: 200, volume_type: 'gp2', state: 'available', issues: ['unattached'] } },
      { resource_id: 'sg-0123456789abcdef0', resource_type: 'security_group', provider: 'aws', region: 'us-east-1', payload: { name: 'bastion', open_ports: [{ port: 22, label: 'SSH', cidr: '0.0.0.0/0' }] } },
      { resource_id: 'aws-cost-2026-10', resource_type: 'aws_cost', provider: 'aws', region: 'global', payload: { mtd_cost: 1243.57, top_services: topServices } },
    ],
  },
  'GET /rightsizing': {
    tenant_id: 't_demo', cpu_threshold_pct: 20, ec2_total: 1, candidates: 1, total_current_monthly_usd: 59.9, total_rightsized_monthly_usd: 29.95,
    total_monthly_savings_usd: 29.95, total_annual_savings_usd: 359.4,
    recommendations: [{
      resource_id: 'i-0a1b2c3d4e5f60718', name: 'staging-worker', current_instance_type: 't3.large', recommended_instance_type: 't3.medium',
      avg_cpu_7d_pct: 1.8, region: 'us-east-1', current_monthly_usd: 59.9, recommended_monthly_usd: 29.95, monthly_savings_usd: 29.95,
      annual_savings_usd: 359.4, confidence: 'high', action: 'Resize from t3.large to t3.medium',
    }],
  },
  'POST /scan': { ok: true, tenant_id: 't_demo', credentials_scanned: 1, total_events_found: 4, total_actions_queued: 0, scans: [{ status: 'finished' }] },
}

export type MockState = 'empty' | 'scanned' | 'error500' | 'error401' | 'hang'

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
const json = (route: Route, status: number, body: unknown, headers: Record<string, string> = {}) =>
  route.fulfill({ status, headers: { ...headers }, contentType: 'application/json', body: JSON.stringify(body) })

/** Mock the Cloudlink backend and the dashboard's own /api routes for one page. */
export async function mockBackend(page: Page, state: MockState) {
  const calls: string[] = []
  await page.route(`${API}/**`, async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const key = `${req.method()} ${new URL(req.url()).pathname}`
    calls.push(key)
    if (state === 'hang') return new Promise<void>(() => {})
    if (state === 'error500') return json(route, 500, { detail: 'Internal Server Error' }, cors)
    if (state === 'error401') return json(route, 401, { detail: 'Invalid or missing authentication. Use a Clerk session or API key.' }, cors)
    const table = state === 'scanned' ? scannedTenant : emptyTenant
    if (key in table) return json(route, 200, table[key], cors)
    return json(route, req.method() === 'GET' ? 404 : 200, req.method() === 'GET' ? { detail: 'Not Found' } : { ok: true }, cors)
  })
  await page.route('**/api/subscription', (route) => json(route, 200, { plan: 'free', status: 'none', clerk_user_id: 'user_e2e' }))
  await page.route('**/api/savings/**', async (route) => {
    calls.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`)
    if (state === 'hang') return new Promise<void>(() => {})
    if (state === 'error500') return json(route, 500, { error: 'Internal Server Error' })
    return json(route, 200, route.request().url().includes('disputes') ? { disputes: [] } : {
      savings_this_month_usd: 0, cloudlink_fee_this_month_usd: 0, savings_all_time_usd: 0, cloudlink_fee_all_time_usd: 0,
      breakdown: {}, rollover_usd: 0, billing_threshold_usd: 500, pending_billing: false, events: [],
    })
  })
  return calls
}
