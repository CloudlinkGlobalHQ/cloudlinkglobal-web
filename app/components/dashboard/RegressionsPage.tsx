/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getDeployRisk, getRegressions, acknowledgeRegression, resolveRegression, runAutofixRegression, runRegressionDetection } from '../../lib/api'

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:         'bg-red-900/40 text-red-300 border-red-700/50',
    acknowledged: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
    resolved:     'bg-green-900/40 text-green-300 border-green-700/50',
  }
  const cls = map[status] || 'bg-[#1A2340] text-slate-400 border-[#1E2D4F]'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${cls}`}>
      {status}
    </span>
  )
}

function SeverityBar({ pct }: { pct: number }) {
  const color = pct >= 50 ? 'bg-red-500' : pct >= 20 ? 'bg-orange-400' : 'bg-yellow-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#1A2340] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold ${pct >= 50 ? 'text-red-600' : pct >= 20 ? 'text-orange-500' : 'text-yellow-600'}`}>
        +{pct.toFixed(1)}%
      </span>
    </div>
  )
}

const FILTERS = ['all', 'open', 'acknowledged', 'resolved']

export default function RegressionsPage() {
  const [regressions, setRegressions] = useState<any[]>([])
  const [filter, setFilter]           = useState('all')
  const [loading, setLoading]         = useState(true)
  const [busy, setBusy]               = useState<Record<string, string>>({})
  const [running, setRunning]         = useState(false)
  const [msg, setMsg]                 = useState('')
  const [risk, setRisk]               = useState<Record<string, any>>({})

  const load = async (f = filter) => {
    setLoading(true)
    try { setRegressions(await getRegressions(f === 'all' ? undefined : f)) } catch {}
    setLoading(false)
  }

   
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [filter])

  const handleAction = async (id: string, action: 'acknowledge' | 'resolve') => {
    setBusy(b => ({ ...b, [id]: action }))
    try {
      if (action === 'acknowledge') await acknowledgeRegression(id)
      else await resolveRegression(id)
      load()
    } catch (e: any) {
      setMsg(`Error: ${e.message}`)
      setTimeout(() => setMsg(''), 4000)
    }
    setBusy(b => { const n = { ...b }; delete n[id]; return n })
  }

  const handleRunDetection = async () => {
    setRunning(true); setMsg('')
    try {
      const res = await runRegressionDetection()
      setMsg(`${res.regressions_detected} new regression(s) detected`)
      load()
    } catch (e: any) { setMsg(`Error: ${e.message}`) }
    setRunning(false)
    setTimeout(() => setMsg(''), 5000)
  }

  const handleAutofixPreview = async (regression: any) => {
    setBusy(b => ({ ...b, [regression.regression_id]: 'autofix' }))
    try {
      const preview = await runAutofixRegression(regression.regression_id, {
        dry_run: true,
        repo: 'CloudlinkGlobalHQ/cloudlink-agents',
      })
      const changes = (preview.recommended_changes || []).map((item: any) => `- ${item.title}`).join('\n')
      alert(`AutoFix preview for ${regression.service}\n\n${changes || 'No recommendations generated.'}`)
    } catch (e: any) {
      setMsg(`Error: ${e.message}`)
    }
    setBusy(b => { const n = { ...b }; delete n[regression.regression_id]; return n })
  }

  const handleRiskPreview = async (service: string) => {
    if (risk[service]) return
    try {
      const result = await getDeployRisk(service)
      setRisk((current) => ({ ...current, [service]: result }))
    } catch {
      // keep quiet in the card if this fails
    }
  }

  const openCount = regressions.filter(r => r.status === 'open').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Regressions
            {openCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{openCount}</span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Deploy-linked AWS cost spikes detected automatically</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-slate-500">{msg}</span>}
          <button onClick={handleRunDetection} disabled={running}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {running ? 'Running...' : 'Run detection'}
          </button>
          <button onClick={() => load()} className="rounded-xl border border-[#1E2D4F] px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-[#141C33]">Refresh</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-[#0F1629] p-1 rounded-lg w-fit border border-[#1E2D4F]">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
              filter === f ? 'bg-[#141C33] text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
      ) : regressions.length === 0 ? (
        <div className="rounded-[24px] border border-[#1E2D4F] bg-[#0F1629] p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/15">
            <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          </div>
          <p className="text-[#F1F5F9] font-medium mb-1">
            {filter === 'all' ? 'No regressions detected' : `No ${filter} regressions`}
          </p>
          <p className="text-slate-400 text-sm">
            {filter === 'all'
              ? 'Cost regressions appear here when a deploy causes a spike above 10% of your 7-day baseline.'
              : `Switch to "all" to see regressions in other states.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {regressions.map((r: any) => (
            <div key={r.regression_id}
              className={`rounded-[24px] border bg-[#0F1629] p-5 ${r.status === 'open' ? 'border-red-700/50' : 'border-[#1E2D4F]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <StatusBadge status={r.status} />
                    <span className="font-semibold text-slate-100 text-sm">{r.service}</span>
                    {r.environment && (
                      <span className="text-xs bg-[#1A2340] text-slate-300 px-2 py-0.5 rounded">{r.environment}</span>
                    )}
                    <SeverityBar pct={r.pct_change ?? 0} />
                  </div>

                  {/* Cost figures */}
                  <div className="flex flex-wrap gap-6 text-sm mb-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Baseline (7d avg / hr)</p>
                      <p className="font-medium text-slate-700">${(r.baseline_cost_per_hour ?? 0).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Post-deploy (3h avg / hr)</p>
                      <p className="font-medium text-red-600">${(r.post_deploy_cost_per_hour ?? 0).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Confidence</p>
                      <p className="font-medium text-slate-700">{((r.confidence ?? 0) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Deploy link */}
                  {r.deploy_id && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Deploy:</span>
                      {r.version && <code className="bg-[#1A2340] text-slate-300 px-1.5 py-0.5 rounded">{r.version.slice(0, 8)}</code>}
                      <span>{timeAgo(r.deployed_at)}</span>
                      {r.source && <span className="text-slate-400">via {r.source}</span>}
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => handleRiskPreview(r.service)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Load deploy risk context
                    </button>
                    {risk[r.service] && (
                      <div className="mt-2 rounded-lg bg-[#141C33] border border-[#1E2D4F] px-3 py-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-700">Deploy risk:</span> {risk[r.service].score}/100 ({risk[r.service].level})
                        <p className="mt-1 text-slate-500">{risk[r.service].recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleAutofixPreview(r)}
                    disabled={!!busy[r.regression_id]}
                    className="text-xs px-3 py-1.5 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50">
                    {busy[r.regression_id] === 'autofix' ? 'Working...' : 'AutoFix preview'}
                  </button>
                  {r.status === 'open' && (
                    <button onClick={() => handleAction(r.regression_id, 'acknowledge')}
                      disabled={!!busy[r.regression_id]}
                      className="text-xs px-3 py-1.5 border border-yellow-300 text-yellow-700 hover:bg-yellow-50 rounded-lg transition disabled:opacity-50">
                      {busy[r.regression_id] === 'acknowledge' ? 'Working...' : 'Acknowledge'}
                    </button>
                  )}
                  {r.status !== 'resolved' && (
                    <button onClick={() => handleAction(r.regression_id, 'resolve')}
                      disabled={!!busy[r.regression_id]}
                      className="text-xs px-3 py-1.5 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition disabled:opacity-50">
                      {busy[r.regression_id] === 'resolve' ? 'Working...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-2">
                Detected {timeAgo(r.detected_at)} · ID: <code className="text-slate-500">{r.regression_id.slice(0, 16)}…</code>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
