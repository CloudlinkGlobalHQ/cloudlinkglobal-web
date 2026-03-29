'use client'

import { useState } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  params?: string
  body?: string
}

interface Section {
  name: string
  emoji: string
  endpoints: Endpoint[]
}

const API_SECTIONS: Section[] = [
  {
    name: 'Public API v1', emoji: '🌐',
    endpoints: [
      { method: 'GET', path: '/v1/costs', description: 'Aggregated cost data with per-service breakdown', params: '?days=30&provider=gcp' },
      { method: 'GET', path: '/v1/regressions', description: 'Active cost regressions', params: '?status=open|acknowledged|resolved' },
      { method: 'GET', path: '/v1/resources', description: 'All tracked cloud resources', params: '?provider=azure&resource_type=azure_vm' },
      { method: 'GET', path: '/v1/multi-cloud/summary', description: 'Connected clouds, provider coverage, and cloud-level cost totals' },
      { method: 'GET', path: '/v1/governance', description: 'Approval policy posture and budget coverage summary' },
      { method: 'GET', path: '/v1/drift', description: 'White-label drift summary for partner integrations' },
      { method: 'GET', path: '/v1/anomalies', description: 'Cost anomalies (last 7 days)' },
      { method: 'GET', path: '/v1/deploys', description: 'Deploy events', params: '?service=&limit=50' },
      { method: 'GET', path: '/v1/budgets', description: 'Budget guardrails + recent alerts' },
      { method: 'GET', path: '/v1/savings', description: 'Consolidated savings across all features' },
    ]
  },
  {
    name: 'Cost Data', emoji: '💰',
    endpoints: [
      { method: 'GET', path: '/cost-summary', description: 'High-level cost summary' },
      { method: 'GET', path: '/multi-cloud/summary', description: 'Provider-by-provider connected cloud summary' },
      { method: 'POST', path: '/cloud-costs/ingest', description: 'Ingest normalized AWS/GCP/Azure cost records', body: '{"records":[{"provider":"gcp","service":"BigQuery","cost_usd":0.42,"monthly_cost_usd":120.5,"project_id":"demo-project"}]}' },
      { method: 'GET', path: '/cost-forecast', description: 'Linear regression cost forecast', params: '?days_back=30&days_ahead=30' },
      { method: 'GET', path: '/tag-costs', description: 'Cost by AWS tag key-value', params: '?tag_key=Environment' },
      { method: 'GET', path: '/unit-economics', description: 'Cost per resource type and action', params: '?days=30' },
    ]
  },
  {
    name: 'Governance & Drift', emoji: '🛡️',
    endpoints: [
      { method: 'GET', path: '/approval-policies', description: 'List action approval policies' },
      { method: 'PUT', path: '/approval-policies/{action_type}', description: 'Update approval rules for an action type', body: '{"require_approval":true,"auto_approve_min_confidence":0.9}' },
      { method: 'GET', path: '/drift/summary', description: 'Operational drift summary with severity counts' },
      { method: 'GET', path: '/drift/baselines', description: 'List all drift baselines' },
      { method: 'POST', path: '/drift/baselines', description: 'Create a drift baseline', body: '{"resource_id":"i-123","resource_type":"ec2_instance","region":"us-east-1","expected_state":{"instance_type":"t3.micro"}}' },
      { method: 'POST', path: '/drift/scan', description: 'Run drift detection now' },
      { method: 'GET', path: '/drift/events', description: 'List drift events', params: '?limit=50&severity=high' },
    ]
  },
  {
    name: 'Deploy Risk & AutoFix', emoji: '🧠',
    endpoints: [
      { method: 'GET', path: '/deploy-risk/{service}', description: 'Get deploy risk score for a service' },
      { method: 'POST', path: '/deploy-risk/batch', description: 'Get risk scores for multiple services', body: '{"services":["api","worker","dashboard"]}' },
      { method: 'POST', path: '/autofix/regressions/{regression_id}', description: 'Generate a remediation PR preview or create one', body: '{"dry_run":true,"provider":"github","repo":"CloudlinkGlobalHQ/cloudlink-agents"}' },
    ]
  },
  {
    name: 'Virtual Tags', emoji: '🏷️',
    endpoints: [
      { method: 'GET', path: '/virtual-tags', description: 'List all virtual tags' },
      { method: 'POST', path: '/virtual-tags', description: 'Create a virtual tag', body: '{"name":"Production","color":"#22c55e","rules":[{"field":"service","op":"contains","value":"ec2"}]}' },
      { method: 'PUT', path: '/virtual-tags/{id}', description: 'Update a virtual tag' },
      { method: 'DELETE', path: '/virtual-tags/{id}', description: 'Delete a virtual tag' },
      { method: 'GET', path: '/virtual-tags/costs/breakdown', description: 'Cost breakdown by virtual tag', params: '?days=30' },
    ]
  },
  {
    name: 'Kubernetes', emoji: '☸️',
    endpoints: [
      { method: 'GET', path: '/k8s/costs', description: 'Cluster/namespace rollup + hourly trend', params: '?hours_back=168&cluster=' },
      { method: 'GET', path: '/k8s/costs/namespaces', description: 'Per-namespace cost breakdown' },
      { method: 'GET', path: '/k8s/costs/pods', description: 'Top 50 pods by cost' },
      { method: 'POST', path: '/k8s/ingest', description: 'Ingest cost records from OpenCost/Kubecost', body: '{"records":[{"cluster":"prod","namespace":"payments","total_cost_usd":0.0015}]}' },
    ]
  },
  {
    name: 'Anomaly Detection', emoji: '🔍',
    endpoints: [
      { method: 'GET', path: '/anomalies', description: 'List all detected anomalies' },
      { method: 'GET', path: '/anomalies/{service}', description: 'Anomaly analysis for a service' },
      { method: 'POST', path: '/anomalies/{service}/runbook', description: 'AI-generated incident runbook' },
      { method: 'POST', path: '/anomaly-alerts/run', description: 'Trigger anomaly detection scan' },
    ]
  },
  {
    name: 'AutoStop', emoji: '⏹️',
    endpoints: [
      { method: 'GET', path: '/autostop/rules', description: 'List AutoStop rules' },
      { method: 'POST', path: '/autostop/rules', description: 'Create AutoStop rule', body: '{"name":"Stop idle EC2","service":"ec2","idle_threshold_minutes":60,"action":"stop"}' },
      { method: 'GET', path: '/autostop/events', description: 'AutoStop event history', params: '?limit=100' },
      { method: 'GET', path: '/autostop/savings', description: 'Total AutoStop savings' },
      { method: 'POST', path: '/autostop/run', description: 'Trigger AutoStop check now' },
    ]
  },
  {
    name: 'Savings Plans', emoji: '📈',
    endpoints: [
      { method: 'POST', path: '/savings-plans/analyze', description: 'Get SP commitment recommendation', body: '{"commitment_type":"compute","term":"1yr_no_upfront","coverage_pct":70,"days_history":90}' },
      { method: 'GET', path: '/savings-plans/options', description: 'All SP types, terms, discount rates' },
      { method: 'GET', path: '/savings-plans/coverage', description: 'Current eligible spend % for SP coverage' },
    ]
  },
  {
    name: 'SDK (Cost-per-Customer)', emoji: '🧩',
    endpoints: [
      { method: 'POST', path: '/sdk/cost-events', description: 'Ingest cost attribution events from SDK', body: '{"events":[{"service":"api","cost_usd":0.00001,"customer_id":"cust_123","feature":"checkout"}]}' },
      { method: 'GET', path: '/sdk/costs/by-customer', description: 'Per-customer cost breakdown', params: '?days=30&feature=' },
      { method: 'GET', path: '/sdk/costs/by-feature', description: 'Per-feature cost breakdown' },
    ]
  },
  {
    name: 'GitHub App Integration', emoji: '🐙',
    endpoints: [
      { method: 'POST', path: '/github/webhook', description: 'Receive GitHub push/PR webhook events' },
    ]
  },
  {
    name: 'Slack Integration', emoji: '💬',
    endpoints: [
      { method: 'POST', path: '/slack/commands', description: 'Handle /cloudlink slash commands' },
      { method: 'POST', path: '/slack/events', description: 'Handle Slack event subscriptions (app_mention)' },
    ]
  },
  {
    name: 'Budgets', emoji: '🚨',
    endpoints: [
      { method: 'GET', path: '/budgets', description: 'List budget guardrails' },
      { method: 'POST', path: '/budgets', description: 'Create budget', body: '{"name":"Prod Budget","limit_usd":5000,"period":"monthly","alert_pct":80}' },
      { method: 'PUT', path: '/budgets/{id}', description: 'Update budget' },
      { method: 'DELETE', path: '/budgets/{id}', description: 'Delete budget' },
      { method: 'GET', path: '/budgets/alerts', description: 'Budget alert history' },
      { method: 'POST', path: '/budgets/check', description: 'Trigger budget check now' },
    ]
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  POST: 'bg-green-900/40 text-green-300 border-green-700/50',
  PUT: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  DELETE: 'bg-red-900/40 text-red-300 border-red-700/50',
}

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const copy = (text: string, path: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">API Documentation</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complete reference for the Cloudlink REST API. All endpoints require Bearer token authentication.
        </p>
      </div>

      {/* Auth */}
      <div className="bg-slate-900 rounded-xl p-5 text-sm">
        <p className="text-slate-400 mb-2 text-xs font-medium uppercase tracking-wide">Authentication</p>
        <pre className="text-green-400 font-mono text-xs">{`curl ${BASE}/v1/costs \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
        <p className="text-slate-500 text-xs mt-2">Get your API key from the <strong className="text-slate-300">API Keys</strong> page.</p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {API_SECTIONS.map(section => (
          <div key={section.name} className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === section.name ? null : section.name)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#141C33] transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-100">{section.name}</span>
                <span className="text-xs text-slate-400 bg-[#1A2340] px-2 py-0.5 rounded-full">{section.endpoints.length} endpoints</span>
              </div>
              <span className="text-slate-400">{activeSection === section.name ? '▲' : '▼'}</span>
            </button>

            {activeSection === section.name && (
              <div className="border-t border-[#1E2D4F]">
                {section.endpoints.map((ep, i) => (
                  <div key={i} className={`px-6 py-4 ${i > 0 ? 'border-t border-[#1E2D4F]/50' : ''}`}>
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${METHOD_COLORS[ep.method]} shrink-0`}>
                        {ep.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono text-slate-200">{ep.path}</code>
                          {ep.params && <code className="text-xs font-mono text-slate-400">{ep.params}</code>}
                          <button
                            onClick={() => copy(`${BASE}${ep.path}${ep.params || ''}`, ep.path)}
                            className={`text-xs px-2 py-0.5 rounded transition ${copiedPath === ep.path ? 'bg-green-900/40 text-green-400' : 'bg-[#1A2340] text-slate-400 hover:bg-[#1E2D4F]'}`}
                          >
                            {copiedPath === ep.path ? '✓' : 'copy URL'}
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{ep.description}</p>
                        {ep.body && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-400 mb-1">Request body:</p>
                            <pre className="bg-slate-900 text-green-400 text-xs font-mono p-3 rounded-lg overflow-x-auto">{ep.body}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* OpenAPI link */}
      <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-100">Interactive API Explorer</p>
          <p className="text-sm text-slate-400">Test endpoints directly in your browser using the OpenAPI/Swagger UI.</p>
        </div>
        <a href={`${BASE}/docs`} target="_blank" rel="noopener noreferrer"
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
          Open Swagger →
        </a>
      </div>
    </div>
  )
}
