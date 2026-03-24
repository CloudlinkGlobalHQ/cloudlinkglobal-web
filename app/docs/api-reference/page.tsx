export default function APIReferencePage() {
  const endpoints = [
    { method: 'GET', path: '/stats', desc: 'Action counts + resource count for the current tenant' },
    { method: 'GET', path: '/resources', desc: 'List discovered AWS resources' },
    { method: 'GET', path: '/credentials', desc: 'List cloud credentials (secrets masked)' },
    { method: 'POST', path: '/credentials', desc: 'Add a cloud credential' },
    { method: 'DELETE', path: '/credentials/:id', desc: 'Remove a credential' },
    { method: 'POST', path: '/scan', desc: 'Trigger an AWS scan across all credentials' },
    { method: 'GET', path: '/scans', desc: 'List scan history' },
    { method: 'POST', path: '/deploys', desc: 'Record a deploy event' },
    { method: 'GET', path: '/deploys', desc: 'List deploy events' },
    { method: 'GET', path: '/regressions', desc: 'List cost regressions (filter by ?status=open|acknowledged|resolved)' },
    { method: 'POST', path: '/regressions/:id/acknowledge', desc: 'Acknowledge a regression' },
    { method: 'POST', path: '/regressions/:id/resolve', desc: 'Resolve a regression' },
    { method: 'POST', path: '/regression/run', desc: 'Manually trigger regression detection' },
    { method: 'GET', path: '/cost-snapshots', desc: 'List hourly cost snapshots' },
    { method: 'GET', path: '/cost-snapshots/services', desc: 'List tracked AWS services' },
    { method: 'GET', path: '/actions', desc: 'List actions (filter by ?status=)' },
    { method: 'POST', path: '/actions/:id/approve', desc: 'Approve a pending action' },
    { method: 'POST', path: '/actions/:id/reject', desc: 'Reject a pending action' },
    { method: 'GET', path: '/webhooks', desc: 'List registered webhooks' },
    { method: 'POST', path: '/webhooks', desc: 'Register a new webhook' },
    { method: 'DELETE', path: '/webhooks/:id', desc: 'Remove a webhook' },
    { method: 'GET', path: '/audit', desc: 'Query audit log (filter by ?event_type=, ?since=)' },
    { method: 'GET', path: '/subscription/:clerk_user_id', desc: 'Get subscription status for a user' },
    { method: 'GET', path: '/budgets', desc: 'List all budget guardrails with current spend' },
    { method: 'POST', path: '/budgets', desc: 'Create a new budget guardrail' },
    { method: 'PUT', path: '/budgets/:id', desc: 'Update a budget' },
    { method: 'DELETE', path: '/budgets/:id', desc: 'Delete a budget' },
    { method: 'GET', path: '/budgets/alerts', desc: 'List budget alert history' },
    { method: 'POST', path: '/budgets/check', desc: 'Manually trigger budget threshold checks' },
    { method: 'POST', path: '/cost-estimate', desc: 'Predict cost impact of a deploy before it goes live' },
    { method: 'GET', path: '/anomalies', desc: 'Scan all services for cost anomalies (ML-powered)' },
    { method: 'GET', path: '/anomalies/:service', desc: 'Analyze a specific service for cost anomalies' },
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
      <p className="lead">All endpoints require authentication via the <code>Authorization: Bearer YOUR_API_KEY</code> header.</p>

      <h2>Base URL</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">https://cloudlink-agents-production.up.railway.app</pre>

      <h2>Authentication</h2>
      <p>Include your API key in every request:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm">{`curl -H "Authorization: Bearer cl_live_your_key_here" \\
  https://your-api-url/stats`}</pre>

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

      <h2>Rate limits</h2>
      <p>API requests are rate-limited per tenant:</p>
      <ul>
        <li><code>/scan</code> &mdash; 5 requests per minute</li>
        <li><code>/regression/run</code> &mdash; 5 requests per minute</li>
        <li>All other endpoints &mdash; 60 requests per minute</li>
      </ul>

      <h2>Interactive docs</h2>
      <p>For request/response schemas, visit the auto-generated Swagger UI at <code>/docs</code> on your API instance.</p>
    </article>
  )
}
