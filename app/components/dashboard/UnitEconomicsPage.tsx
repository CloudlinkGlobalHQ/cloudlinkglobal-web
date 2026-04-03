'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUnitEconomics } from '../../lib/api'

// ── Types ──────────────────────────────────────────────────────────────────
interface ServiceBreakdown {
  service: string
  total_usd: number
  daily_avg_usd: number
  hourly_avg_usd: number
  data_points: number
}

interface ResourceBreakdown {
  resource_type: string
  count: number
  total_mtd_usd: number
  avg_mtd_usd_per_resource: number
  total_hourly_usd: number
}

interface ActionBreakdown {
  action_type: string
  count: number
  cost_per_action_usd: number
}

interface DailyTrend {
  date: string
  cost_usd: number
}

interface TopResource {
  resource_id: string
  resource_type: string
  name: string
  region: string
  mtd_cost_usd: number
}

interface UnitEconomicsData {
  tenant_id: string
  period_days: number
  total_spend_usd: number
  total_savings_est_usd: number
  savings_ratio_pct: number
  cost_per_action_usd: number
  total_actions: number
  services_breakdown: ServiceBreakdown[]
  resource_breakdown: ResourceBreakdown[]
  action_breakdown: ActionBreakdown[]
  daily_trend: DailyTrend[]
  top_resources: TopResource[]
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2) {
  if (n === 0) return '$0.00'
  if (n < 0.001) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function fmtNum(n: number) {
  return n.toLocaleString('en-US')
}

const COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500',
  'bg-red-500', 'bg-cyan-500',
]

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'green' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  const accent = color === 'green' ? 'text-[#6EE7B7]' : color === 'blue' ? 'text-blue-300'
    : color === 'purple' ? 'text-purple-300' : 'text-yellow-300'
  return (
    <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

function MiniBar({ label, value, max, total, colorClass }: {
  label: string; value: number; max: number; total: number; colorClass: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const sharePct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 truncate text-sm text-slate-700 font-medium" title={label}>{label}</div>
      <div className="flex-1 h-2 bg-[#1A2340] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-sm text-slate-700 font-mono w-20 text-right">{fmt(value)}</div>
      <div className="text-xs text-slate-400 w-12 text-right">{sharePct}%</div>
    </div>
  )
}

function SparkLine({ data }: { data: DailyTrend[] }) {
  if (!data || data.length < 2) {
    return <div className="h-24 flex items-center justify-center text-xs text-slate-400">Not enough data</div>
  }
  const max = Math.max(...data.map(d => d.cost_usd))
  const min = Math.min(...data.map(d => d.cost_usd))
  const range = max - min || 1
  const W = 600
  const H = 80
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.cost_usd - min) / range) * (H - 10) - 5
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * W
        const y = H - ((d.cost_usd - min) / range) * (H - 10) - 5
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="#16a34a" className="opacity-0 hover:opacity-100 transition-opacity" />
        )
      })}
    </svg>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function UnitEconomicsPage() {
  const [data, setData] = useState<UnitEconomicsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [activeTab, setActiveTab] = useState<'services' | 'resources' | 'actions'>('services')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUnitEconomics(days)
      setData(res)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [days])

   
  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load unit economics</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-3 text-sm text-red-600 underline">Retry</button>
      </div>
    )
  }

  if (!data) return null

  const topService = data.services_breakdown[0]
  const maxServiceCost = topService?.total_usd ?? 1
  const maxResourceCost = data.resource_breakdown[0]?.total_mtd_usd ?? 1
  const maxActionCount = data.action_breakdown[0]?.count ?? 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Unit Economics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cost breakdown by service, resource type, and action</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Period:</span>
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                days === d
                  ? 'dashboard-pill-active'
                  : 'dashboard-pill hover:text-slate-200'
              }`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={`Total Spend (${days}d)`}
          value={fmt(data.total_spend_usd)}
          sub={`${fmt(data.total_spend_usd / days)}/day avg`}
          color="green"
        />
        <StatCard
          label="AutoStop Savings"
          value={fmt(data.total_savings_est_usd)}
          sub={`${data.savings_ratio_pct}% of total spend`}
          color="blue"
        />
        <StatCard
          label="Cost Per Action"
          value={fmt(data.cost_per_action_usd, 4)}
          sub={`${fmtNum(data.total_actions)} actions total`}
          color="purple"
        />
        <StatCard
          label="Top Service"
          value={topService?.service ?? '—'}
          sub={topService ? `${fmt(topService.total_usd)} total` : 'No data'}
          color="yellow"
        />
      </div>

      {/* Daily Trend */}
      <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-100">Daily Cost Trend</h2>
          {data.daily_trend.length > 0 && (
            <span className="text-xs text-slate-500">
              {data.daily_trend[0]?.date} → {data.daily_trend[data.daily_trend.length - 1]?.date}
            </span>
          )}
        </div>
        <SparkLine data={data.daily_trend} />
        {data.daily_trend.length > 0 && (
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{fmt(Math.min(...data.daily_trend.map(d => d.cost_usd)))} min</span>
            <span>{fmt(Math.max(...data.daily_trend.map(d => d.cost_usd)))} max</span>
          </div>
        )}
      </div>

      {/* Breakdown tabs */}
      <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
        <div className="border-b border-[#1E2D4F] flex">
          {(['services', 'resources', 'actions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-[#10B981] text-[#6EE7B7]'
                  : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}>
              {tab === 'services' ? 'By Service' : tab === 'resources' ? 'By Resource Type' : 'By Action'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3">
          {activeTab === 'services' && (
            data.services_breakdown.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No cost snapshot data found. Run a scan to populate.</p>
              : data.services_breakdown.map((svc, i) => (
                <div key={svc.service} className="space-y-1">
                  <MiniBar
                    label={svc.service}
                    value={svc.total_usd}
                    max={maxServiceCost}
                    total={data.total_spend_usd}
                    colorClass={COLORS[i % COLORS.length]}
                  />
                  <div className="ml-32 text-xs text-slate-400 flex gap-4">
                    <span>{fmt(svc.daily_avg_usd)}/day</span>
                    <span>{fmt(svc.hourly_avg_usd)}/hr</span>
                    <span>{fmtNum(svc.data_points)} data pts</span>
                  </div>
                </div>
              ))
          )}

          {activeTab === 'resources' && (
            data.resource_breakdown.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No resource cost data found.</p>
              : data.resource_breakdown.map((rb, i) => (
                <div key={rb.resource_type} className="space-y-1">
                  <MiniBar
                    label={rb.resource_type}
                    value={rb.total_mtd_usd}
                    max={maxResourceCost}
                    total={data.resource_breakdown.reduce((s, r) => s + r.total_mtd_usd, 0)}
                    colorClass={COLORS[i % COLORS.length]}
                  />
                  <div className="ml-32 text-xs text-slate-400 flex gap-4">
                    <span>{fmtNum(rb.count)} resources</span>
                    <span>{fmt(rb.avg_mtd_usd_per_resource)} avg/resource</span>
                    <span>{fmt(rb.total_hourly_usd)}/hr total</span>
                  </div>
                </div>
              ))
          )}

          {activeTab === 'actions' && (
            data.action_breakdown.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No actions recorded yet.</p>
              : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-[#1E2D4F]/50">
                      <th className="pb-2">Action Type</th>
                      <th className="pb-2 text-right">Count</th>
                      <th className="pb-2 text-right">Cost / Action</th>
                      <th className="pb-2">
                        <div className="ml-3 text-right">Share</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.action_breakdown.map((a, i) => (
                      <tr key={a.action_type} className="hover:bg-[#141C33]">
                        <td className="py-2.5 font-medium text-slate-200">{a.action_type}</td>
                        <td className="py-2.5 text-right text-slate-600">{fmtNum(a.count)}</td>
                        <td className="py-2.5 text-right font-mono text-slate-700">{fmt(a.cost_per_action_usd, 4)}</td>
                        <td className="py-2.5 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#1A2340] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                                style={{ width: `${(a.count / maxActionCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-10 text-right">
                              {((a.count / data.total_actions) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}
        </div>
      </div>

      {/* Top Resources */}
      {data.top_resources.length > 0 && (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1E2D4F]/50">
            <h2 className="font-semibold text-slate-100">Top 10 Most Expensive Resources (MTD)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-[#141C33]">
                <th className="px-5 py-2.5">#</th>
                <th className="px-5 py-2.5">Resource</th>
                <th className="px-5 py-2.5">Type</th>
                <th className="px-5 py-2.5">Region</th>
                <th className="px-5 py-2.5 text-right">MTD Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.top_resources.map((r, i) => (
                <tr key={r.resource_id} className="hover:bg-[#141C33]">
                  <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-200">{r.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{r.resource_id?.slice(0, 12)}…</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-[#1A2340] text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {r.resource_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{r.region ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-100">
                    {fmt(r.mtd_cost_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
