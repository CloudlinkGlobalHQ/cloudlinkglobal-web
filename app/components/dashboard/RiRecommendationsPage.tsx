'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRiRecommendations } from '../../lib/api'

interface RiRec {
  instance_type: string
  instance_family: string
  active_count: number
  idle_count: number
  total_count: number
  regions: string[]
  avg_cpu_pct: number
  confidence: 'high' | 'medium' | 'low'
  monthly_ondemand_usd: number
  monthly_ri_1yr_usd: number
  monthly_savings_1yr_usd: number
  annual_savings_1yr_usd: number
  annual_savings_3yr_usd: number
  discount_pct_1yr: number
  discount_pct_3yr: number
  action: string
}

interface RiData {
  ec2_total: number
  ec2_analyzed: number
  total_monthly_ondemand_usd: number
  total_monthly_savings_1yr_usd: number
  total_annual_savings_1yr_usd: number
  total_annual_savings_3yr_usd: number
  recommendations: RiRec[]
  note: string
}

const CONFIDENCE_STYLES = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-500',
}

function fmt(n: number) {
  if (!n || n === 0) return '$0'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function CpuBar({ pct }: { pct: number }) {
  const color = pct > 20 ? 'bg-green-500' : pct > 5 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  )
}

export default function RiRecommendationsPage() {
  const [data, setData] = useState<RiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'1yr' | '3yr'>('1yr')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getRiRecommendations())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

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
        <p className="text-red-600 font-medium">Failed to load RI recommendations</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-3 text-sm text-red-600 underline">Retry</button>
      </div>
    )
  }

  if (!data) return null

  const annualSavings = view === '1yr' ? data.total_annual_savings_1yr_usd : data.total_annual_savings_3yr_usd
  const recs = data.recommendations

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reserved Instance Recommendations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Commit to Reserved Instances for predictable workloads and save up to 57%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Term:</span>
          {(['1yr', '3yr'] as const).map(t => (
            <button key={t} onClick={() => setView(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                view === t ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'
              }`}>
              {t === '1yr' ? '1 Year' : '3 Years'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-l-4 border-l-green-500 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">EC2 Analyzed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.ec2_analyzed}</p>
          <p className="text-xs text-slate-400 mt-1">of {data.ec2_total} total</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-blue-500 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">On-Demand Monthly</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.total_monthly_ondemand_usd)}</p>
          <p className="text-xs text-slate-400 mt-1">current spend</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-yellow-500 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monthly Savings ({view})</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmt(data.total_monthly_savings_1yr_usd)}</p>
          <p className="text-xs text-slate-400 mt-1">if all RI committed</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-purple-500 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Annual Savings ({view})</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmt(annualSavings)}</p>
          <p className="text-xs text-slate-400 mt-1">if all RI committed</p>
        </div>
      </div>

      {/* No data state */}
      {recs.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-4xl mb-3">🖥️</p>
          <p className="font-semibold text-slate-700">No EC2 instances found</p>
          <p className="text-sm text-slate-500 mt-1">
            Run a scan to discover your EC2 fleet and get RI recommendations.
          </p>
        </div>
      )}

      {/* Recommendations table */}
      {recs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Instance Type Analysis</h2>
            <span className="text-xs text-slate-400">{recs.length} type(s) with active instances</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                  <th className="px-5 py-3">Instance Type</th>
                  <th className="px-5 py-3 text-center">Active</th>
                  <th className="px-5 py-3">Avg CPU</th>
                  <th className="px-5 py-3 text-center">Confidence</th>
                  <th className="px-5 py-3 text-right">On-Demand/mo</th>
                  <th className="px-5 py-3 text-right">RI/mo ({view})</th>
                  <th className="px-5 py-3 text-right">Savings/mo</th>
                  <th className="px-5 py-3 text-right">Annual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recs.map(rec => {
                  const monthlySav = view === '1yr' ? rec.monthly_savings_1yr_usd : rec.monthly_savings_1yr_usd
                  const annSav = view === '1yr' ? rec.annual_savings_1yr_usd : rec.annual_savings_3yr_usd
                  const discPct = view === '1yr' ? rec.discount_pct_1yr : rec.discount_pct_3yr
                  return (
                    <tr key={rec.instance_type} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-800">{rec.instance_type}</div>
                        <div className="text-xs text-slate-400">{rec.regions.slice(0, 2).join(', ')}</div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-bold text-slate-800">{rec.active_count}</span>
                        {rec.idle_count > 0 && (
                          <span className="text-xs text-slate-400 ml-1">({rec.idle_count} idle)</span>
                        )}
                      </td>
                      <td className="px-5 py-3 w-28">
                        <CpuBar pct={rec.avg_cpu_pct} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONFIDENCE_STYLES[rec.confidence]}`}>
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-600">{fmt(rec.monthly_ondemand_usd)}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-600">
                        {fmt(rec.monthly_ri_1yr_usd)}
                        <div className="text-xs text-green-600 font-medium">{discPct}% off</div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-green-600">{fmt(monthlySav)}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-green-700">{fmt(annSav)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={4} className="px-5 py-3 font-semibold text-slate-700">Total</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">
                    {fmt(data.total_monthly_ondemand_usd)}
                  </td>
                  <td className="px-5 py-3" />
                  <td className="px-5 py-3 text-right font-mono font-bold text-green-600">
                    {fmt(data.total_monthly_savings_1yr_usd)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-green-700">
                    {fmt(annualSavings)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* How to act */}
      {recs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-800 mb-3">How to purchase Reserved Instances</h3>
          <ol className="space-y-2 text-sm text-green-700">
            <li className="flex gap-2"><span className="shrink-0 font-bold">1.</span>Go to <strong>AWS Console → EC2 → Reserved Instances → Purchase Reserved Instances</strong></li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">2.</span>Select the instance type, OS (Linux), and term (1 or 3 year)</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">3.</span>Choose <strong>No Upfront</strong> for lowest commitment risk, or <strong>All Upfront</strong> for maximum discount</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">4.</span>Consider <strong>Convertible RIs</strong> if you may need to change instance types within the term</li>
          </ol>
          <p className="text-xs text-green-600 mt-3 italic">{data.note}</p>
        </div>
      )}
    </div>
  )
}
