'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSavingsReport } from '../../lib/api'

interface ReportData {
  report_month: string
  generated_at: string
  spend: { mtd_usd: number; prev_month_usd: number; mom_delta_usd: number; mom_delta_pct: number }
  savings: { autostop_usd: number; autostop_events: number; completed_actions: number; action_savings_est_usd: number; total_est_usd: number }
  actions_by_type: Record<string, number>
  top_services: { service: string; mtd_usd: number }[]
  budgets: { name: string; limit_usd: number; current_usd: number; utilization_pct: number; status: string }[]
  regressions_mtd: number
  resources_tracked: number
}

function fmt(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function fmtK(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n) }

const BUDGET_STATUS_STYLES: Record<string, string> = {
  ok: 'bg-green-900/40 text-green-300',
  warning: 'bg-yellow-100 text-yellow-700',
  breach: 'bg-red-100 text-red-600',
}

export default function SavingsReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await getSavingsReport()) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

   
  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm text-center">{error}</div>
  if (!data) return null

  const { spend, savings } = data
  const momDir = spend.mom_delta_pct >= 0 ? 'up' : 'down'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Monthly Savings Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data.report_month} · Generated {new Date(data.generated_at).toLocaleString()}
          </p>
        </div>
        <button onClick={() => window.print()}
          className="dashboard-secondary-button px-4 py-2 text-sm">
          Print / Export
        </button>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F1629] rounded-xl border border-l-4 border-l-blue-500 border-[#1E2D4F] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">MTD Spend</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{fmtK(spend.mtd_usd)}</p>
          {spend.prev_month_usd > 0 && (
            <p className={`text-xs mt-1 font-medium ${momDir === 'up' ? 'text-red-500' : 'text-green-600'}`}>
              {momDir === 'up' ? '↑' : '↓'} {Math.abs(spend.mom_delta_pct).toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className="bg-[#0F1629] rounded-xl border border-l-4 border-l-green-500 border-[#1E2D4F] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Savings Est.</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmtK(savings.total_est_usd)}</p>
          <p className="text-xs text-slate-400 mt-1">this month</p>
        </div>
        <div className="bg-[#0F1629] rounded-xl border border-l-4 border-l-purple-500 border-[#1E2D4F] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">AutoStop Savings</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{fmtK(savings.autostop_usd)}</p>
          <p className="text-xs text-slate-400 mt-1">{savings.autostop_events} stop events</p>
        </div>
        <div className="bg-[#0F1629] rounded-xl border border-l-4 border-l-orange-500 border-[#1E2D4F] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actions Completed</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{savings.completed_actions}</p>
          <p className="text-xs text-slate-400 mt-1">{data.resources_tracked} resources tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Top Services by Spend</h2>
          {data.top_services.length === 0 ? (
            <p className="text-sm text-slate-400">No cost data for this month yet.</p>
          ) : (
            <div className="space-y-3">
              {data.top_services.map((svc, i) => {
                const pct = spend.mtd_usd > 0 ? (svc.mtd_usd / spend.mtd_usd) * 100 : 0
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                return (
                  <div key={svc.service}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{svc.service}</span>
                      <span className="font-mono text-slate-200">{fmt(svc.mtd_usd)}</span>
                    </div>
                    <div className="h-2 bg-[#1A2340] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions breakdown */}
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Actions Taken This Month</h2>
          {Object.keys(data.actions_by_type).length === 0 ? (
            <p className="text-sm text-slate-400">No actions completed this month.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {Object.entries(data.actions_by_type)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <tr key={type} className="hover:bg-[#141C33]">
                      <td className="py-2 text-slate-700 font-medium capitalize">{type.replace(/_/g, ' ')}</td>
                      <td className="py-2 text-right font-bold text-slate-200">{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Budget health */}
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Budget Health</h2>
          {data.budgets.length === 0 ? (
            <p className="text-sm text-slate-400">No budgets configured. <a href="/dashboard/budgets" className="text-green-600 underline">Set one up →</a></p>
          ) : (
            <div className="space-y-3">
              {data.budgets.map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{b.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BUDGET_STATUS_STYLES[b.status] ?? ''}`}>
                      {b.utilization_pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#1A2340] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.status === 'breach' ? 'bg-red-500' : b.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(b.utilization_pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{fmt(b.current_usd)} spent</span>
                    <span>{fmt(b.limit_usd)} limit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Month Summary</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Report period', data.report_month],
              ['Resources tracked', String(data.resources_tracked)],
              ['Cost regressions', String(data.regressions_mtd)],
              ['Previous month spend', spend.prev_month_usd > 0 ? fmt(spend.prev_month_usd) : 'No data'],
              ['MoM change', spend.prev_month_usd > 0 ? `${spend.mom_delta_pct >= 0 ? '+' : ''}${spend.mom_delta_pct.toFixed(1)}%` : '—'],
              ['AutoStop events', String(savings.autostop_events)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
