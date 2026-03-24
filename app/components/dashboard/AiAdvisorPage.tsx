'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAiAdvisor } from '../../lib/api'

// ── Types ──────────────────────────────────────────────────────────────────
interface Recommendation {
  id: string
  title: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimated_monthly_savings_usd: number
  effort: 'low' | 'medium' | 'high'
  description: string
  action: string
}

interface AdvisorData {
  summary: string
  score: number
  recommendations: Recommendation[]
  quick_wins: string[]
  _source: 'openai' | 'rules'
  context: {
    total_spend_30d_usd: number
    resource_counts: { total: number; idle_ec2: number; unattached_ebs: number }
    autostop_savings_est_usd: number
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
}

const EFFORT_STYLES = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-500',
}

const CATEGORY_ICONS: Record<string, string> = {
  compute: '🖥️',
  storage: '💾',
  network: '🌐',
  database: '🗄️',
  autostop: '⏹️',
  rightsizing: '📐',
  reserved: '🔖',
  other: '⚙️',
}

function fmt(n: number) {
  if (!n || n === 0) return '$0'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function ScoreRing({ score }: { score: number }) {
  const r = 38
  const circumference = 2 * Math.PI * r
  const progress = ((100 - score) / 100) * circumference
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626'

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-slate-500">/ 100</div>
      </div>
    </div>
  )
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50 transition"
      >
        <div className="text-2xl mt-0.5 shrink-0">{CATEGORY_ICONS[rec.category] ?? '⚙️'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priority]}`}>
              {rec.priority.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 capitalize">{rec.category}</span>
            <span className="text-xs text-slate-400">
              Effort: <span className={`font-medium capitalize ${EFFORT_STYLES[rec.effort]}`}>{rec.effort}</span>
            </span>
          </div>
          <p className="font-semibold text-slate-800 mt-1.5">{rec.title}</p>
        </div>
        <div className="shrink-0 text-right">
          {rec.estimated_monthly_savings_usd > 0 && (
            <div>
              <div className="text-lg font-bold text-green-600">{fmt(rec.estimated_monthly_savings_usd)}</div>
              <div className="text-xs text-slate-400">est./mo savings</div>
            </div>
          )}
        </div>
        <div className="shrink-0 text-slate-400 text-lg mt-1">{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm text-slate-600">{rec.description}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">▶ Next step</p>
            <p className="text-sm text-green-800">{rec.action}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AiAdvisorPage() {
  const [data, setData] = useState<AdvisorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAiAdvisor()
      setData(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500">Analyzing your cloud infrastructure…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load AI Advisor</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-3 text-sm text-red-600 underline">Retry</button>
      </div>
    )
  }

  if (!data) return null

  const filtered = filter === 'all'
    ? data.recommendations
    : data.recommendations.filter(r => r.priority === filter || r.category === filter)

  const totalSavings = data.recommendations.reduce(
    (sum, r) => sum + (r.estimated_monthly_savings_usd || 0), 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Cost Advisor</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data._source === 'openai' ? '✨ Powered by GPT-4o-mini' : '⚡ Rule-based analysis'}
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          ↻ Refresh analysis
        </button>
      </div>

      {/* Score + summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-6">
        <ScoreRing score={data.score} />
        <div className="flex-1">
          <h2 className="font-semibold text-slate-800 mb-1">Optimization Score</h2>
          <p className="text-sm text-slate-600">{data.summary}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <div>
              <span className="font-bold text-green-600">{fmt(totalSavings)}</span>
              <span className="text-slate-400 text-xs">/mo potential savings</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">{data.recommendations.length}</span>
              <span className="text-slate-400 text-xs"> recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick wins */}
      {data.quick_wins?.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-800 mb-3">⚡ Quick Wins</h3>
          <ul className="space-y-2">
            {data.quick_wins.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="shrink-0 text-green-500 mt-0.5">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Filter:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition capitalize ${
              filter === f
                ? 'bg-green-600 text-white border-green-600'
                : 'border-slate-200 text-slate-600 hover:border-green-400'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No recommendations match the current filter.
          </div>
        ) : (
          filtered.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
