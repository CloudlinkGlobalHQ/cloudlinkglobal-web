'use client'

import { useEffect, useState } from 'react'
import { getDemoSummary, getCostSummary, getCredentials, getDeploys, getTrackedServices } from '../../lib/api'

// ─── Onboarding checklist ────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'credential',
    title: 'Add an AWS credential',
    desc: 'Connect your AWS account so Cloudlink can scan your infrastructure.',
    href: '/dashboard/credentials',
    cta: 'Go to Credentials →',
  },
  {
    id: 'scan',
    title: 'Run your first scan',
    desc: 'Discover cloud resources and start collecting hourly cost snapshots.',
    href: null, // triggered via the Run scan button
    cta: 'Click ▶ Run scan above',
  },
  {
    id: 'deploy',
    title: 'Connect your CI pipeline',
    desc: 'Send deploy events so Cloudlink can link cost spikes to specific releases.',
    href: '/dashboard/deploys',
    cta: 'Go to Deploys →',
  },
  {
    id: 'baseline',
    title: 'Build your cost baseline',
    desc: 'Cloudlink needs 7 days of hourly data to detect regressions reliably. Hang tight — this happens automatically.',
    href: null,
    cta: 'Auto-completes in ~7 days',
  },
]

function CheckIcon({ done }: { done: boolean }) {
  if (done) return (
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
  return (
    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0" />
  )
}

function OnboardingChecklist({
  hasCredential, hasScanned, hasDeploy, hasBaseline, stepsLoaded,
}: {
  hasCredential: boolean; hasScanned: boolean; hasDeploy: boolean; hasBaseline: boolean; stepsLoaded: boolean
}) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('cl_onboarding_dismissed') === '1'
  })

  const allDone = hasCredential && hasScanned && hasDeploy && hasBaseline
  const doneCount = [hasCredential, hasScanned, hasDeploy, hasBaseline].filter(Boolean).length

  if (dismissed || !stepsLoaded) return null
  if (allDone) {
    // Auto-dismiss after all done
    if (typeof window !== 'undefined') localStorage.setItem('cl_onboarding_dismissed', '1')
    return null
  }

  const states = { credential: hasCredential, scan: hasScanned, deploy: hasDeploy, baseline: hasBaseline }

  // Find first incomplete step index for progress highlight
  const firstIncomplete = STEPS.findIndex(s => !states[s.id as keyof typeof states])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Getting started</h2>
          <p className="text-xs text-slate-400 mt-0.5">{doneCount} of {STEPS.length} steps complete</p>
        </div>
        <button onClick={() => { setDismissed(true); localStorage.setItem('cl_onboarding_dismissed', '1') }}
          className="text-xs text-slate-400 hover:text-slate-600 transition">Dismiss</button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / STEPS.length) * 100}%` }} />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = states[step.id as keyof typeof states]
          const active = !done && i === firstIncomplete
          return (
            <div key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition ${
                active ? 'bg-green-50 border border-green-100' : done ? 'opacity-50' : 'opacity-70'
              }`}>
              <CheckIcon done={done} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {step.title}
                </p>
                {!done && <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>}
              </div>
              {!done && step.href && (
                <a href={step.href}
                  className="flex-shrink-0 text-xs font-medium text-green-600 hover:text-green-700 whitespace-nowrap">
                  {step.cta}
                </a>
              )}
              {!done && !step.href && (
                <span className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">{step.cta}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS:           'bg-green-100 text-green-800',
  PENDING:           'bg-blue-100 text-blue-700',
  AWAITING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  FAILED:            'bg-red-100 text-red-700',
  RETRY:             'bg-orange-100 text-orange-700',
  IN_PROGRESS:       'bg-purple-100 text-purple-700',
}

function StatCard({ label, value, sub, color = 'indigo' }: { label: string; value: any; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    indigo: 'text-green-700', green: 'text-green-700',
    yellow: 'text-yellow-700', red: 'text-red-700', orange: 'text-orange-600',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color] || colors.indigo}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function timeAgo(iso: string | null) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function CostBar({ services }: { services: Record<string, number> }) {
  if (!services || Object.keys(services).length === 0) return null
  const entries = Object.entries(services).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const COLORS = ['bg-green-500','bg-blue-400','bg-cyan-400','bg-teal-400','bg-emerald-400','bg-amber-400']
  return (
    <div className="mt-4">
      <div className="flex rounded-full overflow-hidden h-3 gap-px mb-3">
        {entries.map(([svc, cost], i) => (
          <div key={svc} className={`${COLORS[i % COLORS.length]} transition-all`}
            style={{ width: `${(cost / total) * 100}%` }} title={`${svc}: $${cost.toFixed(2)}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {entries.map(([svc, cost], i) => (
          <div key={svc} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${COLORS[i % COLORS.length]}`} />
            <span className="truncate">{svc.replace('Amazon ', '').replace('AWS ', '')}</span>
            <span className="ml-auto font-medium text-slate-700">${cost.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Overview({ stats, onRefresh }: { stats: any; onRefresh: () => void }) {
  const [summary, setSummary]           = useState<any>(null)
  const [cost, setCost]                 = useState<any>(null)
  const [hasCredential, setHasCredential] = useState(false)
  const [hasDeploy, setHasDeploy]       = useState(false)
  const [hasBaseline, setHasBaseline]   = useState(false)
  const [stepsLoaded, setStepsLoaded]   = useState(false)

  useEffect(() => {
    getDemoSummary().then(setSummary).catch(() => {})
    getCostSummary().then(setCost).catch(() => {})
  }, [stats])

  // Load onboarding step states once
  useEffect(() => {
    Promise.allSettled([
      getCredentials(),
      getDeploys(),
      getTrackedServices(),
    ]).then(([creds, deploys, services]) => {
      setHasCredential(creds.status === 'fulfilled' && Array.isArray(creds.value) && creds.value.length > 0)
      setHasDeploy(deploys.status === 'fulfilled' && Array.isArray(deploys.value) && deploys.value.length > 0)
      // Baseline is "done" if we have tracked services with snapshots (proxy for 7d data)
      setHasBaseline(services.status === 'fulfilled' && Array.isArray(services.value?.services) && services.value.services.length > 0)
      setStepsLoaded(true)
    })
  }, [])

  const byStatus = stats?.actions_by_status || {}
  const total    = Object.values(byStatus).reduce((a: number, b: any) => a + b, 0) as number
  const success  = byStatus.SUCCESS || 0
  const pending  = byStatus.PENDING || 0
  const awaiting = byStatus.AWAITING_APPROVAL || 0
  const failed   = (byStatus.FAILED || 0) + (byStatus.RETRY || 0)
  const lastScan = summary?.last_scan || stats?.last_scan
  const lastRun  = summary?.last_run

  const hasScanned = !!(summary?.last_scan || stats?.last_scan)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Live view of your cloud infrastructure</p>
        </div>
        <button onClick={onRefresh} className="text-sm text-green-600 hover:underline">↻ Refresh</button>
      </div>

      <OnboardingChecklist
        hasCredential={hasCredential}
        hasScanned={hasScanned}
        hasDeploy={hasDeploy}
        hasBaseline={hasBaseline}
        stepsLoaded={stepsLoaded}
      />

      {(lastScan || lastRun) && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 mb-6 flex flex-wrap gap-6 text-sm text-slate-500">
          {lastScan && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${lastScan.status === 'finished' ? 'bg-green-400' : lastScan.status === 'error' ? 'bg-red-400' : 'bg-blue-400'}`} />
              <span>Last scan: <span className="text-slate-700 font-medium">{timeAgo(lastScan.started_at)}</span></span>
              {lastScan.events_found != null && <span className="text-slate-400">({lastScan.events_found} events)</span>}
            </div>
          )}
          {lastRun && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Last run: <span className="text-slate-700 font-medium">{timeAgo(lastRun.started_at)}</span></span>
              {lastRun.success_count != null && <span className="text-slate-400">({lastRun.success_count} succeeded)</span>}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Resources tracked" value={stats?.resources_count} color="indigo" />
        <StatCard label="Actions completed" value={success}               color="green" />
        <StatCard label="Awaiting approval" value={awaiting}              color="yellow" />
        <StatCard label="Failed / Retry"    value={failed}                color="red" />
      </div>

      {cost && cost.total_mtd_usd > 0 && (
        <div className={`rounded-xl border p-5 mb-6 ${cost.above_threshold ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-700">AWS Spend — Month to Date</h2>
            {cost.above_threshold && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Above threshold</span>}
          </div>
          <p className={`text-3xl font-bold mb-1 ${cost.above_threshold ? 'text-red-600' : 'text-slate-800'}`}>
            ${cost.total_mtd_usd.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mb-2">across {cost.credential_count} AWS credential(s)</p>
          <CostBar services={cost.top_services} />
        </div>
      )}

      {total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Action status breakdown</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(byStatus).map(([status, count]) => (
              <span key={status} className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
                {status.replace(/_/g, ' ')}: {count as number}
              </span>
            ))}
          </div>
          <div className="flex rounded-full overflow-hidden h-3 gap-px">
            {success  > 0 && <div className="bg-green-400 transition-all"  style={{ width: `${(success /total)*100}%` }} />}
            {pending  > 0 && <div className="bg-blue-400 transition-all"   style={{ width: `${(pending /total)*100}%` }} />}
            {awaiting > 0 && <div className="bg-yellow-400 transition-all" style={{ width: `${(awaiting/total)*100}%` }} />}
            {failed   > 0 && <div className="bg-red-400 transition-all"    style={{ width: `${(failed  /total)*100}%` }} />}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
            <span>🟢 Success: {success}</span>
            <span>🔵 Pending: {pending}</span>
            <span>🟡 Awaiting: {awaiting}</span>
            <span>🔴 Failed+Retry: {failed}</span>
          </div>
        </div>
      )}

      {summary?.recent_actions?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent actions</h2>
          <div className="space-y-1">
            {summary.recent_actions.slice(0, 8).map((a: any) => (
              <div key={a.action_id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-700">{a.action_type}</span>
                  <span className="text-slate-400 ml-2 text-xs truncate">{a.resource_id}</span>
                  {a.reason && <p className="text-xs text-slate-400 mt-0.5 truncate">{a.reason}</p>}
                </div>
                <span className={`ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
