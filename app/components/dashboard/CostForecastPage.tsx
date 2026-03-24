'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCostForecast } from '../../lib/api'

interface HistoricalDay { date: string; actual_usd: number }
interface ForecastDay { date: string; predicted_usd: number; lower_usd: number; upper_usd: number }
interface ServiceForecast {
  service: string
  current_period_usd: number
  forecast_next_period_usd: number
  daily_trend_usd: number
  trend_direction: 'up' | 'down' | 'stable'
}
interface ForecastData {
  has_data: boolean
  message?: string
  days_back: number
  days_ahead: number
  historical_period_usd: number
  forecast_period_usd: number
  daily_trend_usd: number
  trend_direction: 'up' | 'down' | 'stable'
  trend_pct_per_day: number
  data_points: number
  historical: HistoricalDay[]
  forecast: ForecastDay[]
  service_forecasts: ServiceForecast[]
}

const TREND_COLORS = { up: 'text-red-500', down: 'text-green-600', stable: 'text-slate-500' }
const TREND_ICONS = { up: '↑', down: '↓', stable: '→' }
const TREND_BG = { up: 'bg-red-50 border-red-200', down: 'bg-green-50 border-green-200', stable: 'bg-slate-50 border-slate-200' }

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function SparkForecast({ historical, forecast }: { historical: HistoricalDay[]; forecast: ForecastDay[] }) {
  const all = [
    ...historical.map(h => h.actual_usd),
    ...forecast.map(f => f.upper_usd),
  ]
  const max = Math.max(...all) || 1
  const W = 700
  const H = 100
  const totalPoints = historical.length + forecast.length

  const toXY = (i: number, val: number) => ({
    x: (i / (totalPoints - 1)) * W,
    y: H - (val / max) * (H - 10) - 5,
  })

  const histPts = historical.map((h, i) => toXY(i, h.actual_usd))
  const forecastPts = forecast.map((f, i) => toXY(historical.length + i, f.predicted_usd))
  const upperPts = forecast.map((f, i) => toXY(historical.length + i, f.upper_usd))
  const lowerPts = forecast.map((f, i) => toXY(historical.length + i, f.lower_usd))

  const histPath = histPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const forecastPath = forecastPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Confidence band polygon
  const bandPath = [
    ...upperPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
    ...[...lowerPts].reverse().map(p => `L ${p.x} ${p.y}`),
    'Z'
  ].join(' ')

  const splitX = histPts.length > 0 ? histPts[histPts.length - 1].x : 0

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
        {/* Confidence band */}
        <path d={bandPath} fill="#16a34a" fillOpacity={0.08} />
        {/* Historical line */}
        <path d={histPath} fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        {/* Forecast line */}
        <path d={forecastPath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="6,3" strokeLinejoin="round" />
        {/* Divider */}
        <line x1={splitX} y1="0" x2={splitX} y2={H} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,2" />
      </svg>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>← {historical[0]?.date}</span>
        <span className="text-slate-300">│ forecast →</span>
        <span>{forecast[forecast.length - 1]?.date} →</span>
      </div>
    </div>
  )
}

export default function CostForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daysBack, setDaysBack] = useState(30)
  const [daysAhead, setDaysAhead] = useState(30)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await getCostForecast(daysBack, daysAhead)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [daysBack, daysAhead])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  )
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600 font-medium">{error}</p>
      <button onClick={load} className="mt-2 text-sm text-red-500 underline">Retry</button>
    </div>
  )
  if (!data) return null
  if (!data.has_data) return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
      <p className="text-slate-500">{data.message}</p>
    </div>
  )

  const delta = data.forecast_period_usd - data.historical_period_usd
  const deltaPct = data.historical_period_usd > 0 ? (delta / data.historical_period_usd) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cost Forecast</h1>
          <p className="text-sm text-slate-500 mt-0.5">Linear trend projection based on {data.data_points} days of data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">History:</span>
            {[14, 30, 60].map(d => (
              <button key={d} onClick={() => setDaysBack(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${daysBack === d ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'}`}>
                {d}d
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Forecast:</span>
            {[7, 14, 30, 60].map(d => (
              <button key={d} onClick={() => setDaysAhead(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${daysAhead === d ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-l-4 border-l-slate-400 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actual ({daysBack}d)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.historical_period_usd)}</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-l-green-500 border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Forecast ({daysAhead}d)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.forecast_period_usd)}</p>
        </div>
        <div className={`bg-white rounded-xl border border-l-4 border-slate-200 p-5 shadow-sm ${delta > 0 ? 'border-l-red-400' : 'border-l-green-500'}`}>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Projected Change</p>
          <p className={`text-2xl font-bold mt-1 ${delta > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {delta >= 0 ? '+' : ''}{fmt(delta)}
          </p>
          <p className={`text-xs mt-0.5 ${delta > 0 ? 'text-red-400' : 'text-green-500'}`}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
          </p>
        </div>
        <div className={`bg-white rounded-xl border border-l-4 border-slate-200 p-5 shadow-sm`}>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Daily Trend</p>
          <p className={`text-2xl font-bold mt-1 ${TREND_COLORS[data.trend_direction]}`}>
            {TREND_ICONS[data.trend_direction]} {data.daily_trend_usd >= 0 ? '+' : ''}{fmt(data.daily_trend_usd)}/d
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Spend Trend &amp; Forecast</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-slate-500 inline-block" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500 inline-block" /> Forecast</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-green-500 opacity-10 inline-block rounded" /> 95% CI</span>
          </div>
        </div>
        <SparkForecast historical={data.historical} forecast={data.forecast} />
      </div>

      {/* Service forecasts */}
      {data.service_forecasts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Per-Service Projections</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3 text-right">Current ({daysBack}d)</th>
                <th className="px-5 py-3 text-right">Forecast ({daysAhead}d)</th>
                <th className="px-5 py-3 text-right">Daily Trend</th>
                <th className="px-5 py-3 text-center">Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.service_forecasts.map(sf => (
                <tr key={sf.service} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{sf.service}</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-600">{fmt(sf.current_period_usd)}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800">{fmt(sf.forecast_next_period_usd)}</td>
                  <td className={`px-5 py-3 text-right font-mono text-sm ${TREND_COLORS[sf.trend_direction]}`}>
                    {sf.daily_trend_usd >= 0 ? '+' : ''}{sf.daily_trend_usd.toFixed(2)}/d
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TREND_BG[sf.trend_direction]} ${TREND_COLORS[sf.trend_direction]}`}>
                      {TREND_ICONS[sf.trend_direction]} {sf.trend_direction}
                    </span>
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
