export const metadata = { title: 'API reference' }

const API_BASE = 'https://cloudlink-agents.onrender.com'
const CONTACT = 'satvikranga60@gmail.com'

export default function APIReferencePage() {
  const endpoints = [
    { method: 'GET', path: '/health', desc: 'Service health check (no API key needed)' },
    { method: 'GET', path: '/setup/cloudformation-template', desc: 'Download the read-only IAM role CloudFormation template (no API key needed)' },
    { method: 'GET', path: '/stats', desc: 'Resource count and last scan for your account' },
    { method: 'GET', path: '/credentials', desc: 'List connected AWS accounts (secrets masked)' },
    { method: 'POST', path: '/credentials', desc: 'Add an AWS account: { cloud: "aws", label, role_arn, external_id, regions }' },
    { method: 'POST', path: '/credentials/:id/verify', desc: 'Assume the role and return the AWS account identity' },
    { method: 'DELETE', path: '/credentials/:id', desc: 'Remove a connected account' },
    { method: 'POST', path: '/scan', desc: 'Start a scan of all connected accounts (optional body: { credential_ids: [...] })' },
    { method: 'GET', path: '/scans', desc: 'Scan history' },
    { method: 'GET', path: '/resources', desc: 'Scanned resources (?resource_type=, ?limit=, ?offset=)' },
    { method: 'POST', path: '/deploys', desc: 'Record a deploy event' },
    { method: 'GET', path: '/deploys', desc: 'List deploy events (?service=, ?limit=)' },
    { method: 'GET', path: '/deploys/:id', desc: 'Get one deploy event' },
    { method: 'GET', path: '/regressions', desc: 'List cost regressions (?status=open|acknowledged|resolved, ?limit=)' },
    { method: 'GET', path: '/regressions/:id', desc: 'Get one regression' },
    { method: 'POST', path: '/regressions/:id/acknowledge', desc: 'Mark an open regression as acknowledged' },
    { method: 'POST', path: '/regressions/:id/resolve', desc: 'Mark a regression as resolved' },
    { method: 'POST', path: '/regression/run', desc: 'Run regression detection now' },
    { method: 'GET', path: '/cost-snapshots', desc: 'Hourly cost snapshots by service (?service=, ?limit=)' },
    { method: 'GET', path: '/cost-snapshots/services', desc: 'Service names that have cost snapshot data' },
    { method: 'GET', path: '/budgets', desc: "List budgets with this month's spend and utilization" },
    { method: 'POST', path: '/budgets', desc: 'Create a budget: { name, monthly_limit_usd, scope, service, alert_thresholds }' },
    { method: 'PUT', path: '/budgets/:id', desc: 'Update a budget' },
    { method: 'DELETE', path: '/budgets/:id', desc: 'Delete a budget' },
    { method: 'GET', path: '/budgets/alerts', desc: 'Budget alert history (?budget_id=, ?limit=)' },
    { method: 'POST', path: '/budgets/check', desc: 'Check budgets now and send alerts (Slack, webhooks) for thresholds reached. Alerts only; nothing is blocked.' },
    { method: 'GET', path: '/webhooks', desc: 'List webhooks (secrets masked)' },
    { method: 'POST', path: '/webhooks', desc: 'Register a webhook: { url, secret?, events? }' },
    { method: 'DELETE', path: '/webhooks/:id', desc: 'Remove a webhook' },
    { method: 'POST', path: '/webhooks/test', desc: 'Send a ping event to webhooks subscribed to ping' },
    { method: 'GET', path: '/settings/slack', desc: 'Get the Slack webhook setting' },
    { method: 'PUT', path: '/settings/slack', desc: 'Set the Slack webhook: { slack_webhook_url, enabled }' },
    { method: 'POST', path: '/settings/slack/test', desc: 'Send a test message to Slack' },
    { method: 'GET', path: '/v1/costs', desc: 'Total cost, cost by service and daily trend from cost snapshots (?days=30)' },
    { method: 'GET', path: '/v1/regressions', desc: 'Regressions (?status=)' },
    { method: 'GET', path: '/v1/resources', desc: 'Scanned resources (?resource_type=)' },
    { method: 'GET', path: '/v1/deploys', desc: 'Deploy events (?service=, ?limit=)' },
    { method: 'GET', path: '/v1/budgets', desc: 'Budgets with their most recent alerts' },
  ]

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
  }

  return (
    <article className="prose prose-gray max-w-none">
      <h1>API Reference</h1>
      <p className="lead">Every endpoint except <code>/health</code> and <code>/setup/cloudformation-template</code> needs an API key, sent as <code>Authorization: Bearer YOUR_API_KEY</code>.</p>

      <h2>Base URL</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">{API_BASE}</pre>
      <p>Most endpoints have no version prefix. The <code>/v1</code> endpoints are read-only views of the same data.</p>

      <h2>Authentication</h2>
      <p>Include your API key in every request:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  ${API_BASE}/stats`}</pre>
      <p>During the pilot, API keys are issued by the Cloudlink team. Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> to request one. A key only sees its own account&apos;s data.</p>

      <h2>Read-only mode</h2>
      <p>Cloudlink never changes anything in your AWS account. Endpoints that would change a resource, such as approving or running actions, AutoStop runs, and starting or stopping resources, return HTTP 403 and are not listed here.</p>

      <h2>Endpoints</h2>
      <div className="not-prose">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Path</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${methodColors[ep.method]}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-800">{ep.path}</td>
                  <td className="px-4 py-2.5 text-gray-600">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2>Response format</h2>
      <p>All responses are JSON. Successful responses return the data directly. Errors return:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">{`{
  "detail": "Error message here"
}`}</pre>
      <p>Common status codes: 400 or 422 (missing or invalid field), 401 (missing or invalid API key), 403 (blocked by read-only mode), 404 (not found), 429 (rate limited).</p>

      <h2>Rate limits</h2>
      <p>These endpoints are rate-limited per Cloudlink account and return HTTP 429 when the limit is exceeded:</p>
      <ul>
        <li><code>POST /scan</code> &mdash; 5 requests per minute</li>
        <li><code>POST /regression/run</code> &mdash; 5 requests per minute</li>
        <li><code>POST /credentials</code> &mdash; 10 requests per minute</li>
      </ul>

      <h2>Interactive docs</h2>
      <p>Request and response schemas are in the auto-generated Swagger UI at <code>{`${API_BASE}/docs`}</code>.</p>
    </article>
  )
}
