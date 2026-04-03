/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getDeploys, runRegressionDetection } from '../../lib/api'

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function EnvBadge({ env }: { env: string }) {
  const map: Record<string, string> = {
    production: 'bg-green-900/40 text-green-300 border-green-700/50',
    staging:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
    preview:    'bg-blue-900/40 text-blue-300 border-blue-700/50',
  }
  const cls = map[env?.toLowerCase()] || 'bg-[#1A2340] text-slate-400 border-[#1E2D4F]'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {env || 'production'}
    </span>
  )
}

function RegressionBadge({ status }: { status?: string }) {
  if (!status || status === 'none') return <span className="text-xs text-slate-400">—</span>
  const map: Record<string, string> = {
    open:         'bg-red-900/40 text-red-300 border-red-700/50',
    acknowledged: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
    resolved:     'bg-green-900/40 text-green-300 border-green-700/50',
    clean:        'bg-[#0A0E1A] text-slate-400 border-[#1E2D4F]',
  }
  const cls = map[status] || 'bg-[#1A2340] text-slate-400 border-[#1E2D4F]'
  const icons: Record<string, string> = { open: 'Open', acknowledged: 'Ack', resolved: 'Resolved', clean: 'Clean' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {icons[status] || ''} {status}
    </span>
  )
}

const GH_SNIPPET = `- name: Notify Cloudlink of deploy
  if: success()
  run: |
    curl -s -X POST \${{ secrets.CLOUDLINK_API_URL }}/deploys \\
      -H "Authorization: Bearer \${{ secrets.CLOUDLINK_API_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "service": "Amazon EC2",
        "version": "\${{ github.sha }}",
        "environment": "production",
        "source": "github_actions"
      }'`

export default function DeploysPage() {
  const [deploys, setDeploys]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [running, setRunning]     = useState(false)
  const [msg, setMsg]             = useState('')
  const [showSnippet, setShowSnippet] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setDeploys(await getDeploys()) } catch {}
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const handleRunDetection = async () => {
    setRunning(true); setMsg('')
    try {
      const res = await runRegressionDetection()
      setMsg(`Detection complete — ${res.regressions_detected} regression(s) found`)
      load()
    } catch (e: any) {
      setMsg(`Error: ${e.message}`)
    }
    setRunning(false)
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Deploys</h1>
          <p className="text-slate-500 text-sm mt-1">Track deploys and link them to cost regressions</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-slate-500">{msg}</span>}
          <button onClick={() => setShowSnippet(s => !s)}
            className="dashboard-secondary-button text-sm px-3 py-1.5">
            {showSnippet ? 'Hide' : 'CI setup'}
          </button>
          <button onClick={handleRunDetection} disabled={running}
            className="dashboard-primary-button disabled:opacity-60 text-sm px-4 py-2">
            {running ? 'Running…' : 'Run detection'}
          </button>
          <button onClick={load} className="dashboard-secondary-button text-sm px-3 py-1.5">Refresh</button>
        </div>
      </div>

      {/* CI snippet */}
      {showSnippet && (
        <div className="bg-slate-900 rounded-xl p-5 mb-6 text-sm">
          <p className="text-slate-400 text-xs mb-3 font-medium">Add to your GitHub Actions workflow (after deploy step):</p>
          <pre className="text-green-400 overflow-x-auto text-xs leading-relaxed whitespace-pre">{GH_SNIPPET}</pre>
          <p className="text-slate-500 text-xs mt-3">
            Set <code className="text-slate-300">CLOUDLINK_API_URL</code> and <code className="text-slate-300">CLOUDLINK_API_KEY</code> in your repo secrets.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
      ) : deploys.length === 0 ? (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-12 text-center">
          <div className="w-12 h-12 bg-[#1A2340] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#10B981] text-lg font-bold">↑</span>
          </div>
          <p className="text-slate-200 font-medium mb-1">No deploys tracked yet</p>
          <p className="text-slate-400 text-sm mb-4">Send a webhook from your CI/CD pipeline after each deploy.</p>
          <button onClick={() => setShowSnippet(true)}
            className="dashboard-primary-button text-sm px-4 py-2">
            Show setup snippet
          </button>
        </div>
      ) : (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2D4F] bg-[#141C33]">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Env</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Deployed</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Regression</th>
              </tr>
            </thead>
            <tbody>
              {deploys.map((d: any) => (
                <tr key={d.deploy_id} className="border-b border-[#1E2D4F] hover:bg-[#141C33] transition">
                  <td className="px-5 py-3">
                    <span className="font-medium text-slate-200">{d.service}</span>
                  </td>
                  <td className="px-4 py-3">
                    {d.version
                      ? <code className="text-xs bg-[#1A2340] text-slate-300 px-1.5 py-0.5 rounded">{d.version.slice(0, 8)}</code>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3"><EnvBadge env={d.environment} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{d.source || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs" title={d.deployed_at}>{timeAgo(d.deployed_at)}</td>
                  <td className="px-4 py-3"><RegressionBadge status={d.regression_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
