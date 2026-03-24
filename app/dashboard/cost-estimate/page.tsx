'use client'

import { useState, useEffect } from 'react'
import { estimateDeployCost, getTrackedServices } from '../../lib/api'

interface Estimate {
  service: string
  has_data: boolean
  message?: string
  baseline_hourly_usd?: number
  baseline_monthly_usd?: number
  trend_7d_vs_30d_pct?: number
  avg_deploy_impact_pct?: number
  estimated_post_deploy_hourly_usd?: number
  estimated_post_deploy_monthly_usd?: number
  estimated_delta_monthly_usd?: number
  recent_deploy_count?: number
  confidence?: string
  budget_impact?: Array<{
    budget_name: string
    budget_limit_usd: number
    projected_spend_usd: number
    projected_utilization_pct: number
    would_breach: boolean
  }>
}

export default function CostEstimatePage() {
  const [services, setServices] = useState<string[]>([])
  const [service, setService] = useState('')
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<Estimate | null>(null)

  useEffect(() => {
    getTrackedServices().then(s => setServices(s.services || [])).catch(() => {})
  }, [])

  const handleEstimate = async () => {
    if (!service) return
    setLoading(true)
    setEstimate(null)
    try {
      const result = await estimateDeployCost({ service })
      setEstimate(result)
    } catch {}
    setLoading(false)
  }

  const confidenceColor = (c: string) => {
    if (c === 'high') return 'bg-green-100 text-green-700'
    if (c === 'medium') return 'bg-yellow-100 text-yellow-700'
    return 'bg-slate-100 text-slate-600'
  }

  const trendIcon = (pct: number) => {
    if (pct > 5) return { icon: '\u2191', color: 'text-red-500', label: 'Increasing' }
    if (pct < -5) return { icon: '\u2193', color: 'text-green-500', label: 'Decreasing' }
    return { icon: '\u2192', color: 'text-slate-500', label: 'Stable' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pre-Deploy Cost Estimation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Predict the cost impact of a deployment before it goes live. Uses historical cost data and deploy patterns.
        </p>
      </div>

      {/* Service selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Select a service to estimate</h2>
        <div className="flex gap-3">
          <select value={service} onChange={e => setService(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Choose a service…</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleEstimate} disabled={loading || !service}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60 shadow-sm">
            {loading ? 'Estimating…' : 'Estimate cost'}
          </button>
        </div>
      </div>

      {/* Results */}
      {estimate && !estimate.has_data && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium">{estimate.message}</p>
        </div>
      )}

      {estimate && estimate.has_data && (
        <div className="space-y-4">
          {/* Main estimate card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Estimated Impact: {estimate.service}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${confidenceColor(estimate.confidence || 'low')}`}>
                {estimate.confidence} confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Current Monthly</p>
                <p className="text-xl font-bold text-gray-900">${estimate.baseline_monthly_usd?.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">${estimate.baseline_hourly_usd?.toFixed(4)}/hr</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Estimated Post-Deploy</p>
                <p className="text-xl font-bold text-gray-900">${estimate.estimated_post_deploy_monthly_usd?.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">${estimate.estimated_post_deploy_hourly_usd?.toFixed(4)}/hr</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Estimated Change</p>
                <p className={`text-xl font-bold ${(estimate.estimated_delta_monthly_usd || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(estimate.estimated_delta_monthly_usd || 0) > 0 ? '+' : ''}${estimate.estimated_delta_monthly_usd?.toLocaleString()}/mo
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(estimate.avg_deploy_impact_pct || 0) > 0 ? '+' : ''}{estimate.avg_deploy_impact_pct}% avg impact
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">7d vs 30d Trend</p>
                {(() => {
                  const t = trendIcon(estimate.trend_7d_vs_30d_pct || 0)
                  return (
                    <>
                      <p className={`text-xl font-bold ${t.color}`}>{t.icon} {Math.abs(estimate.trend_7d_vs_30d_pct || 0)}%</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.label}</p>
                    </>
                  )
                })()}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              Based on {estimate.recent_deploy_count} recent deploy(s) for this service
            </p>
          </div>

          {/* Budget impact */}
          {estimate.budget_impact && estimate.budget_impact.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget Impact</h3>
              <div className="space-y-3">
                {estimate.budget_impact.map((bi, i) => (
                  <div key={i} className={`rounded-lg p-4 ${bi.would_breach ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{bi.budget_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Projected: ${bi.projected_spend_usd.toLocaleString()} / ${bi.budget_limit_usd.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${bi.would_breach ? 'text-red-600' : 'text-green-600'}`}>
                          {bi.projected_utilization_pct}%
                        </p>
                        {bi.would_breach && (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            WOULD BREACH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder when no estimate */}
      {!estimate && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🔮</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Predict before you deploy</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Select a service above to see predicted cost impact based on your historical deployment patterns and cost data.
          </p>
        </div>
      )}
    </div>
  )
}
