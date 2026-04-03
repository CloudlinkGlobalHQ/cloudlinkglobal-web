/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Filter, RefreshCw, WandSparkles } from 'lucide-react'
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
    open:         'bg-red-500/10 text-red-300 border-red-500/30',
    acknowledged: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    resolved:     'bg-[#10B981]/10 text-[#6EE7B7] border-[#10B981]/30',
  }
  const cls = map[status] || 'bg-[#1A2340] text-[#94A3B8] border-[#1E2D4F]'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${cls}`}>
      {status}
    </span>
  )
}

function getSeverity(pct: number) {
  if (pct >= 75) return { label: 'Critical', tone: 'bg-red-500/10 text-red-300 border-red-500/30', bar: 'bg-red-500' }
  if (pct >= 40) return { label: 'High', tone: 'bg-orange-500/10 text-orange-300 border-orange-500/30', bar: 'bg-orange-400' }
  if (pct >= 20) return { label: 'Medium', tone: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30', bar: 'bg-yellow-400' }
  return { label: 'Low', tone: 'bg-blue-500/10 text-blue-300 border-blue-500/30', bar: 'bg-blue-400' }
}

function SeverityBar({ pct }: { pct: number }) {
  const severity = getSeverity(pct)
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#1A2340] rounded-full overflow-hidden">
        <div className={`h-full ${severity.bar} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-xs font-semibold ${pct >= 75 ? 'text-red-300' : pct >= 40 ? 'text-orange-300' : pct >= 20 ? 'text-yellow-300' : 'text-blue-300'}`}>
        +{pct.toFixed(1)}%
      </span>
      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severity.tone}`}>
        {severity.label}
      </span>
    </div>
  )
}

const FILTERS = ['all', 'open', 'acknowledged', 'resolved']

export default function RegressionsPage() {
  const [regressions, setRegressions] = useState<any[]>([])
  const [filter, setFilter]           = useState('all')
  const [serviceFilter, setServiceFilter] = useState('')
  const [loading, setLoading]         = useState(true)
  const [busy, setBusy]               = useState<Record<string, string>>({})
  const [running, setRunning]         = useState(false)
  const [msg, setMsg]                 = useState('')
  const [risk, setRisk]               = useState<Record<string, any>>({})
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({})

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
  const visible = regressions.filter((r) => {
    if (!serviceFilter.trim()) return true
    const query = serviceFilter.trim().toLowerCase()
    return String(r.service || '').toLowerCase().includes(query) || String(r.environment || '').toLowerCase().includes(query)
  })

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#F1F5F9]">
            Regressions
            {openCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{openCount}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">Deploy-linked cost spikes, with severity, evidence, and next actions.</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-[#94A3B8]">{msg}</span>}
          <button onClick={handleRunDetection} disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#059669] disabled:opacity-60">
            <WandSparkles size={14} />
            {running ? 'Running...' : 'Run detection'}
          </button>
          <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-[#1E2D4F] bg-[#141C33] px-3.5 py-2 text-sm font-medium text-[#94A3B8] transition hover:border-[#2E3D5F] hover:text-[#F1F5F9]"><RefreshCw size={14} />Refresh</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          <Filter size={12} />
          Filters
        </div>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <input
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value)}
            placeholder="Filter by service or environment"
            className="min-w-0 rounded-xl border border-[#1E2D4F] bg-[#141C33] px-3 py-2 text-sm text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[#10B981]/50 focus:outline-none lg:w-64"
          />
          <div className="flex gap-1 rounded-lg border border-[#1E2D4F] bg-[#141C33] p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                  filter === f ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="rounded-[24px] border border-[#1E2D4F] bg-[#0F1629] p-5">
              <div className="mb-4 h-4 w-32 animate-pulse rounded bg-[#1E2D4F]" />
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
              </div>
              <div className="h-10 animate-pulse rounded bg-[#141C33]" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-[24px] border border-[#1E2D4F] bg-[#0F1629] p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/15">
            <AlertTriangle size={18} className="text-[#10B981]" />
          </div>
          <p className="mb-1 font-medium text-[#F1F5F9]">
            {regressions.length === 0 ? (filter === 'all' ? 'No regressions detected' : `No ${filter} regressions`) : 'No regressions match this filter'}
          </p>
          <p className="text-sm text-[#64748B]">
            {regressions.length === 0
              ? (filter === 'all'
              ? 'Cost regressions appear here when a deploy causes a spike above 10% of your 7-day baseline.'
              : `Switch to "all" to see regressions in other states.`)
              : 'Try clearing your service filter or switching the current regression state.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r: any) => (
            <div key={r.regression_id}
              className={`rounded-[24px] border bg-[#0F1629] p-5 ${r.status === 'open' ? 'border-red-700/50' : 'border-[#1E2D4F]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <StatusBadge status={r.status} />
                    <span className="text-sm font-semibold text-[#F1F5F9]">{r.service}</span>
                    {r.environment && (
                      <span className="rounded bg-[#1A2340] px-2 py-0.5 text-xs text-[#CBD5E1]">{r.environment}</span>
                    )}
                    <SeverityBar pct={r.pct_change ?? 0} />
                  </div>

                  {/* Cost figures */}
                  <div className="flex flex-wrap gap-6 text-sm mb-3">
                    <div>
                      <p className="mb-0.5 text-xs text-[#64748B]">Baseline (7d avg / hr)</p>
                      <p className="font-medium text-[#E2E8F0]">${(r.baseline_cost_per_hour ?? 0).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-[#64748B]">Post-deploy (3h avg / hr)</p>
                      <p className="font-medium text-red-300">${(r.post_deploy_cost_per_hour ?? 0).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-[#64748B]">Confidence</p>
                      <p className="font-medium text-[#E2E8F0]">{((r.confidence ?? 0) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Deploy link */}
                  {r.deploy_id && (
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span>Deploy:</span>
                      {r.version && <code className="rounded bg-[#1A2340] px-1.5 py-0.5 text-[#CBD5E1]">{r.version.slice(0, 8)}</code>}
                      <span>{timeAgo(r.deployed_at)}</span>
                      {r.source && <span className="text-[#94A3B8]">via {r.source}</span>}
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => handleRiskPreview(r.service)}
                      className="text-xs text-[#10B981] hover:text-[#6EE7B7] hover:underline"
                    >
                      Load deploy risk context
                    </button>
                    {risk[r.service] && (
                      <div className="mt-2 rounded-lg border border-[#1E2D4F] bg-[#141C33] px-3 py-2 text-xs text-[#94A3B8]">
                        <span className="font-semibold text-[#E2E8F0]">Deploy risk:</span> {risk[r.service].score}/100 ({risk[r.service].level})
                        <p className="mt-1 text-[#64748B]">{risk[r.service].recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpanded((current) => ({ ...current, [r.regression_id]: !current[r.regression_id] }))}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E2D4F] px-3 py-1.5 text-xs text-[#94A3B8] transition hover:border-[#2E3D5F] hover:bg-[#141C33] hover:text-[#F1F5F9]"
                  >
                    {expanded[r.regression_id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded[r.regression_id] ? 'Hide details' : 'Details'}
                  </button>
                  <button onClick={() => handleAutofixPreview(r)}
                    disabled={!!busy[r.regression_id]}
                    className="rounded-lg border border-[#10B981]/30 px-3 py-1.5 text-xs text-[#10B981] transition hover:bg-[#10B981]/10 disabled:opacity-50">
                    {busy[r.regression_id] === 'autofix' ? 'Working...' : 'AutoFix preview'}
                  </button>
                  {r.status === 'open' && (
                    <button onClick={() => handleAction(r.regression_id, 'acknowledge')}
                      disabled={!!busy[r.regression_id]}
                      className="rounded-lg border border-orange-500/30 px-3 py-1.5 text-xs text-orange-300 transition hover:bg-orange-500/10 disabled:opacity-50">
                      {busy[r.regression_id] === 'acknowledge' ? 'Working...' : 'Acknowledge'}
                    </button>
                  )}
                  {r.status !== 'resolved' && (
                    <button onClick={() => handleAction(r.regression_id, 'resolve')}
                      disabled={!!busy[r.regression_id]}
                      className="rounded-lg border border-[#10B981]/40 px-3 py-1.5 text-xs text-[#10B981] transition hover:bg-[#10B981]/10 disabled:opacity-50">
                      {busy[r.regression_id] === 'resolve' ? 'Working...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>

              {expanded[r.regression_id] && (
                <div className="mt-4 grid gap-3 rounded-2xl border border-[#1E2D4F] bg-[#141C33] p-4 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Attribution</p>
                    <p className="mt-2 text-sm text-[#CBD5E1]">Environment: <span className="text-[#F1F5F9]">{r.environment || 'n/a'}</span></p>
                    <p className="mt-1 text-sm text-[#CBD5E1]">Source: <span className="text-[#F1F5F9]">{r.source || 'Cloudlink detector'}</span></p>
                    <p className="mt-1 text-sm text-[#CBD5E1]">Version: <span className="text-[#F1F5F9]">{r.version || 'n/a'}</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Response</p>
                    <p className="mt-2 text-sm text-[#CBD5E1]">Detected: <span className="text-[#F1F5F9]">{timeAgo(r.detected_at)}</span></p>
                    <p className="mt-1 text-sm text-[#CBD5E1]">Baseline delta: <span className="text-[#F1F5F9]">+{(r.pct_change ?? 0).toFixed(1)}%</span></p>
                    <p className="mt-1 text-sm text-[#CBD5E1]">Regression ID: <span className="font-mono text-[#94A3B8]">{r.regression_id}</span></p>
                  </div>
                </div>
              )}

              <p className="mt-3 border-t border-[#1E2D4F] pt-2 text-xs text-[#64748B]">
                Detected {timeAgo(r.detected_at)} · ID: <code className="text-[#94A3B8]">{r.regression_id.slice(0, 16)}…</code>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
