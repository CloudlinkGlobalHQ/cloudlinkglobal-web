'use client'

import { useEffect, useState, useCallback } from 'react'

interface SavingsSummary {
  savings_this_month_usd: number
  cloudlink_fee_this_month_usd: number
  savings_all_time_usd: number
  cloudlink_fee_all_time_usd: number
  billing_threshold_usd: number
  pending_billing: boolean
  rollover_usd: number
  breakdown: {
    AUTOSTOP: number
    IDLE_RESOURCE: number
    REGRESSION_PREVENTION: number
    MISCONFIGURATION_FIX: number
  }
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

const SAVING_TYPE_LABELS: Record<string, string> = {
  AUTOSTOP: 'AutoStopping',
  IDLE_RESOURCE: 'Idle Resources',
  REGRESSION_PREVENTION: 'Regression Prevention',
  MISCONFIGURATION_FIX: 'Misconfiguration Fixes',
}

export default function SavingsWidget() {
  const [data, setData] = useState<SavingsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/savings/summary')
      if (res.ok) setData(await res.json())
    } catch {}
    finally { setLoading(false) }
  }, [])

   
  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const {
    savings_this_month_usd,
    cloudlink_fee_this_month_usd,
    savings_all_time_usd,
    cloudlink_fee_all_time_usd,
    billing_threshold_usd,
    pending_billing,
    rollover_usd,
    breakdown,
  } = data

  const thresholdPct = Math.min((savings_this_month_usd / billing_threshold_usd) * 100, 100)
  const hasAnySavings = savings_all_time_usd > 0 || savings_this_month_usd > 0

  return (
    <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Cloudlink Savings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            We charge 15% of verified savings. Zero if we save you zero.
          </p>
        </div>
        {pending_billing && (
          <span className="text-xs font-medium bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full">
            Invoice generating this month
          </span>
        )}
      </div>

      {/* 4 stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Savings this month</p>
          <p className="mt-1.5 text-2xl font-bold text-green-600">{fmt(savings_this_month_usd)}</p>
          {rollover_usd > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">+{fmt(rollover_usd)} rolled over</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Projected fee (15%)</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-700">{fmt(cloudlink_fee_this_month_usd)}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {pending_billing ? 'Due this month' : savings_this_month_usd < billing_threshold_usd ? `$${(billing_threshold_usd - savings_this_month_usd).toFixed(0)} until billing` : 'Billing active'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">All-time savings</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-800">{fmt(savings_all_time_usd)}</p>
          <p className="text-xs text-slate-400 mt-0.5">you keep 85%</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">All-time fees paid</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-800">{fmt(cloudlink_fee_all_time_usd)}</p>
          <p className="text-xs text-slate-400 mt-0.5">total Cloudlink commission</p>
        </div>
      </div>

      {/* Billing threshold progress bar */}
      {savings_this_month_usd < billing_threshold_usd && (
        <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-800 font-medium">
              ${savings_this_month_usd.toFixed(0)} saved this month — billing kicks in at ${billing_threshold_usd}
            </span>
            <span className="text-amber-600 font-semibold">{thresholdPct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${thresholdPct}%` }}
            />
          </div>
          <p className="text-xs text-amber-600 mt-1.5">
            No charge until we hit ${billing_threshold_usd} in savings. Anything below rolls to next month.
          </p>
        </div>
      )}

      {/* Breakdown by saving type */}
      {hasAnySavings && breakdown && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Savings breakdown</p>
          <div className="space-y-2">
            {Object.entries(breakdown).map(([type, amount]) => {
              if (amount <= 0) return null
              const pct = savings_this_month_usd > 0 ? (amount / savings_this_month_usd) * 100 : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-44 shrink-0">{SAVING_TYPE_LABELS[type] || type}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-20 text-right">{fmt(amount as number)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!hasAnySavings && (
        <div className="text-center py-6 text-sm text-slate-400">
          No verified savings yet — connect your AWS account and run your first scan.
        </div>
      )}
    </div>
  )
}
