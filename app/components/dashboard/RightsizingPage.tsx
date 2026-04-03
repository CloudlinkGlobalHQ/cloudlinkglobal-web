'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRightsizing } from '../../lib/api'

interface RightRec {
  resource_id: string
  name: string
  current_instance_type: string
  recommended_instance_type: string
  avg_cpu_7d_pct: number
  region: string
  current_monthly_usd: number
  recommended_monthly_usd: number
  monthly_savings_usd: number
  annual_savings_usd: number
  confidence: 'high' | 'medium' | 'low'
  action: string
}
interface RightData {
  ec2_total: number
  candidates: number
  total_monthly_savings_usd: number
  total_annual_savings_usd: number
  cpu_threshold_pct: number
  recommendations: RightRec[]
}

const CONF = { high: 'bg-green-900/40 text-green-300', medium: 'bg-yellow-900/40 text-yellow-300', low: 'bg-[#1A2340] text-slate-400' }

function fmt(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
function fmtFull(n: number) { return `$${n.toFixed(2)}` }

export default function RightsizingPage() {
  const [data, setData] = useState<RightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(20)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await getRightsizing(threshold)) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [threshold])

   
  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm text-center">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rightsizing Recommendations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Downsize overprovisioned EC2 instances based on actual CPU utilization</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">CPU threshold:</span>
          {[10, 20, 30, 40].map(t => (
            <button key={t} onClick={() => setThreshold(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${threshold === t ? 'dashboard-pill-active' : 'dashboard-pill hover:text-slate-200'}`}>
              &lt;{t}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'EC2 Analyzed', value: String(data.ec2_total), color: 'green' },
          { label: 'Candidates', value: String(data.candidates), color: 'yellow' },
          { label: 'Monthly Savings', value: fmt(data.total_monthly_savings_usd), color: 'green' },
          { label: 'Annual Savings', value: fmt(data.total_annual_savings_usd), color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color === 'green' ? 'text-[#6EE7B7]' : color === 'yellow' ? 'text-yellow-300' : 'text-purple-300'}`}>{value}</p>
          </div>
        ))}
      </div>

      {data.recommendations.length === 0 ? (
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-10 text-center">
          <p className="font-semibold text-slate-200">No rightsizing candidates</p>
          <p className="text-sm text-slate-400 mt-1">All running EC2 instances are above the {threshold}% CPU threshold — well utilized!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.recommendations.map(rec => (
            <div key={rec.resource_id} className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === rec.resource_id ? null : rec.resource_id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#141C33] transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-100">{rec.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONF[rec.confidence]}`}>{rec.confidence}</span>
                    <span className="text-xs text-slate-400">{rec.region}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    <span className="font-mono bg-[#1A2340] px-1.5 rounded text-slate-300">{rec.current_instance_type}</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="font-mono bg-green-900/40 px-1.5 rounded text-green-300">{rec.recommended_instance_type}</span>
                    <span className="ml-3 text-red-400 font-medium">CPU {rec.avg_cpu_7d_pct}% avg</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-green-600">{fmtFull(rec.monthly_savings_usd)}/mo</div>
                  <div className="text-xs text-slate-400">{fmt(rec.annual_savings_usd)}/yr</div>
                </div>
                <span className="text-slate-400 shrink-0">{expanded === rec.resource_id ? '▲' : '▼'}</span>
              </button>
              {expanded === rec.resource_id && (
                <div className="px-5 pb-5 border-t border-[#1E2D4F] pt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-[#141C33] rounded-lg p-3">
                      <p className="text-xs text-slate-400">Current</p>
                      <p className="font-bold text-slate-200">{rec.current_instance_type}</p>
                      <p className="text-slate-400">{fmtFull(rec.current_monthly_usd)}/mo</p>
                    </div>
                    <div className="bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-green-400">Recommended</p>
                      <p className="font-bold text-green-300">{rec.recommended_instance_type}</p>
                      <p className="text-green-400">{fmtFull(rec.recommended_monthly_usd)}/mo</p>
                    </div>
                    <div className="bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-green-400">You save</p>
                      <p className="font-bold text-green-300">{fmtFull(rec.monthly_savings_usd)}/mo</p>
                      <p className="text-green-400">{fmt(rec.annual_savings_usd)}/yr</p>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-sm text-blue-300">
                    <strong>Action:</strong> {rec.action}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
