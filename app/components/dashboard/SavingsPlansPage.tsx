'use client'

import { useState, useCallback } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

interface SpAnalysis {
  commitment_type: string; term: string
  discount_rate_pct: number; coverage_pct_actual: number
  usage: { days_analyzed: number; avg_daily_spend_usd: number; p10_daily_spend_usd: number; annual_eligible_spend_usd: number }
  recommendation: { hourly_commitment_usd: number; monthly_commitment_usd: number; annual_commitment_usd: number; annual_savings_usd: number; roi_pct: number; payback_months: number }
  risk: { level: string; note: string }
  top_eligible_services: { service: string; eligible_spend_usd: number }[]
  next_steps: string[]
}

const RISK_STYLES: Record<string, string> = {
  low: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  insufficient_data: 'bg-[#141C33] text-slate-400 border-[#1E2D4F]',
}

function fmt(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function fmtHr(n: number) { return `$${n.toFixed(4)}/hr` }

export default function SavingsPlansPage() {
  const [analysis, setAnalysis] = useState<SpAnalysis | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const [commitType, setCommitType] = useState('compute')
  const [term, setTerm]             = useState('1yr_no_upfront')
  const [coverage, setCoverage]     = useState(70)
  const [daysHistory, setDaysHistory] = useState(90)

  const analyze = useCallback(async () => {
    setLoading(true); setError(null); setAnalysis(null)
    try {
      const res = await apiFetch('/savings-plans/analyze', {
        method: 'POST',
        body: JSON.stringify({
          commitment_type: commitType,
          term,
          coverage_pct: coverage,
          days_history: daysHistory,
        }),
      })
      setAnalysis(res)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [commitType, term, coverage, daysHistory])

  const SP_TYPES = ['compute', 'ec2_instance', 'sagemaker']
  const TERMS: Record<string, string[]> = {
    compute: ['1yr_no_upfront', '1yr_partial', '1yr_all', '3yr_no_upfront', '3yr_partial', '3yr_all'],
    ec2_instance: ['1yr_no_upfront', '1yr_partial', '1yr_all', '3yr_no_upfront', '3yr_partial', '3yr_all'],
    sagemaker: ['1yr_no_upfront', '1yr_partial', '3yr_no_upfront', '3yr_all'],
  }
  const DISCOUNTS: Record<string, Record<string, number>> = {
    compute: { '1yr_no_upfront': 34, '1yr_partial': 40, '1yr_all': 43, '3yr_no_upfront': 50, '3yr_partial': 58, '3yr_all': 66 },
    ec2_instance: { '1yr_no_upfront': 38, '1yr_partial': 46, '1yr_all': 50, '3yr_no_upfront': 55, '3yr_partial': 63, '3yr_all': 72 },
    sagemaker: { '1yr_no_upfront': 30, '1yr_partial': 36, '3yr_no_upfront': 46, '3yr_all': 64 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Savings Plans Analyzer</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Analyze historical usage and get a data-driven AWS Savings Plans commitment recommendation
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-4">Configure Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Plan Type</label>
            <select value={commitType} onChange={e => { setCommitType(e.target.value); setTerm((TERMS[e.target.value] || [])[0] || '') }}
              className="dashboard-field w-full rounded-lg px-3 py-2 text-sm bg-[#0A0E1A]">
              {SP_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Term & Upfront</label>
            <select value={term} onChange={e => setTerm(e.target.value)}
              className="dashboard-field w-full rounded-lg px-3 py-2 text-sm bg-[#0A0E1A]">
              {(TERMS[commitType] || []).map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')} ({DISCOUNTS[commitType]?.[t]}% off)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Coverage % <span className="text-slate-400">(of P10 baseline)</span></label>
            <div className="flex items-center gap-2">
              <input type="range" min={20} max={100} step={5} value={coverage} onChange={e => setCoverage(Number(e.target.value))}
                className="flex-1 accent-emerald-500" />
              <span className="text-sm font-bold text-slate-200 w-10">{coverage}%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">History (days)</label>
            <select value={daysHistory} onChange={e => setDaysHistory(Number(e.target.value))}
              className="dashboard-field w-full rounded-lg px-3 py-2 text-sm bg-[#0A0E1A]">
              {[30, 60, 90, 180].map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyze} disabled={loading}
          className="dashboard-primary-button disabled:opacity-50 px-6 py-2.5 text-sm shadow-sm">
          {loading ? 'Analyzing…' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
      )}

      {analysis && (
        <div className="space-y-5">
          {/* Hero metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Annual Savings', value: fmt(analysis.recommendation.annual_savings_usd), sub: `${analysis.discount_rate_pct}% discount`, color: 'green' },
              { label: 'Monthly Commitment', value: fmt(analysis.recommendation.monthly_commitment_usd), sub: fmtHr(analysis.recommendation.hourly_commitment_usd), color: 'blue' },
              { label: 'ROI', value: `${analysis.recommendation.roi_pct}%`, sub: `${analysis.recommendation.payback_months}mo payback`, color: 'purple' },
              { label: 'Coverage', value: `${analysis.coverage_pct_actual}%`, sub: 'of eligible spend', color: 'yellow' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] shadow-sm p-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color === 'green' ? 'text-[#6EE7B7]' : color === 'blue' ? 'text-blue-300' : color === 'purple' ? 'text-purple-300' : 'text-yellow-300'}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Risk + details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] p-6">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Usage Analysis</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Days Analyzed', `${analysis.usage.days_analyzed} days`],
                  ['Avg Daily Spend', fmt(analysis.usage.avg_daily_spend_usd)],
                  ['P10 Daily (Baseline)', fmt(analysis.usage.p10_daily_spend_usd)],
                  ['Annual Eligible Spend', fmt(analysis.usage.annual_eligible_spend_usd)],
                  ['Annual Commitment', fmt(analysis.recommendation.annual_commitment_usd)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 border rounded-lg p-3 text-sm ${RISK_STYLES[analysis.risk.level] || RISK_STYLES.insufficient_data}`}>
                <p className="font-semibold mb-0.5">Risk: {analysis.risk.level.replace('_', ' ')}</p>
                {analysis.risk.note && <p className="text-xs opacity-80">{analysis.risk.note}</p>}
              </div>
            </div>

            <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] p-6">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Top Eligible Services</h3>
              {analysis.top_eligible_services.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No eligible services found — run a cloud scan first.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.top_eligible_services.map(svc => (
                    <div key={svc.service} className="flex items-center gap-3">
                      <span className="text-sm text-slate-700 flex-1 truncate font-mono text-xs bg-[#141C33] px-2 py-1 rounded">{svc.service}</span>
                      <span className="text-sm font-semibold text-slate-200 shrink-0">{fmt(svc.eligible_spend_usd)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-100 mb-2">Next Steps</h4>
                <ol className="space-y-1.5">
                  {analysis.next_steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-[#6EE7B7] font-bold shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1 text-slate-100">Ready to commit?</h3>
                <p className="text-slate-400 text-sm">
                  Your recommended commitment: <strong>{fmtHr(analysis.recommendation.hourly_commitment_usd)}</strong> on a <strong>{analysis.term.replace(/_/g, ' ')}</strong> {analysis.commitment_type} plan — saving <strong>{fmt(analysis.recommendation.annual_savings_usd)}/year</strong>.
                </p>
              </div>
              <a href="https://console.aws.amazon.com/billing/home#/savingsPlans/purchase"
                target="_blank" rel="noopener noreferrer"
                className="dashboard-primary-button shrink-0 px-5 py-2.5 text-sm">
                Open AWS Console
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
