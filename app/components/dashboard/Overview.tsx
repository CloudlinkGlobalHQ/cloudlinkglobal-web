'use client'

import { useEffect, useState } from 'react'
import { getDemoSummary, getCostSummary } from '../../lib/api'

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
    indigo: 'text-indigo-700', green: 'text-green-700',
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
  const COLORS = ['bg-indigo-500','bg-blue-400','bg-cyan-400','bg-teal-400','bg-emerald-400','bg-amber-400']
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
  const [summary, setSummary] = useState<any>(null)
  const [cost, setCost] = useState<any>(null)

  useEffect(() => {
    getDemoSummary().then(setSummary).catch(() => {})
    getCostSummary().then(setCost).catch(() => {})
  }, [stats])

  const byStatus = stats?.actions_by_status || {}
  const total    = Object.values(byStatus).reduce((a: number, b: any) => a + b, 0) as number
  const success  = byStatus.SUCCESS || 0
  const pending  = byStatus.PENDING || 0
  const awaiting = byStatus.AWAITING_APPROVAL || 0
  const failed   = (byStatus.FAILED || 0) + (byStatus.RETRY || 0)
  const lastScan = summary?.last_scan || stats?.last_scan
  const lastRun  = summary?.last_run

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Live view of your cloud infrastructure</p>
        </div>
        <button onClick={onRefresh} className="text-sm text-indigo-600 hover:underline">↻ Refresh</button>
      </div>

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

      {total === 0 && !summary?.recent_actions?.length && !cost?.total_mtd_usd && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm mb-2">No data yet</p>
          <p className="text-slate-500 text-sm">
            Add an AWS credential in the{' '}
            <a href="/dashboard/credentials" className="font-medium text-indigo-600">Credentials</a>{' '}tab,
            then click <span className="font-medium text-indigo-600">▶ Run scan</span> to discover resources.
          </p>
        </div>
      )}
    </div>
  )
}
