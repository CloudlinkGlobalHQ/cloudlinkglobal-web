'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'

// Illustrative only: the waste share is an assumption, not a measurement.
const ASSUMED_WASTE_SHARE = 0.2
const FEE_SHARE = 0.15

function fmt(value: number) {
  return `$${Math.round(value).toLocaleString()}`
}

export default function MarketingSavingsCalculator() {
  const [spend, setSpend] = useState(10000)

  const values = useMemo(() => {
    const waste = spend * ASSUMED_WASTE_SHARE
    const cloudlinkFee = waste * FEE_SHARE
    const netSavings = waste - cloudlinkFee
    return { waste, cloudlinkFee, netSavings }
  }, [spend])

  return (
    <section className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">How pricing works</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            We only get paid if you save money.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            Cloudlink charges 15% of the savings we can verify, and nothing if there are none. Move the slider to see how
            that would work at your level of spend. The fall 2026 pilot is free.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#1E2D4F] bg-[#10182E] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <div className="mb-8">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label htmlFor="marketing-spend-range" className="text-sm font-semibold text-[#CBD5E1]">
                Monthly AWS spend
              </label>
              <div className="text-3xl font-bold tracking-[-0.03em] text-[#F8FAFC]">{fmt(spend)}</div>
            </div>
            <input
              id="marketing-spend-range"
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={spend}
              onChange={(event) => setSpend(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1E2D4F] accent-emerald-500"
              aria-describedby="marketing-spend-help"
            />
            <div className="mt-3 flex justify-between text-xs text-[#94A3B8]">
              <span>$1,000</span>
              <span>$100,000</span>
            </div>
            <p id="marketing-spend-help" className="mt-3 text-sm text-[#94A3B8]">
              Illustration only. It assumes 20% of spend is waste, which is an assumption, not a measurement of your
              account. Your real numbers come from a scan.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'If 20% is waste', value: values.waste, tone: 'text-yellow-300' },
              { label: 'Cloudlink fee (15%)', value: values.cloudlinkFee, tone: 'text-slate-200' },
              { label: 'You keep each month', value: values.netSavings, tone: 'text-[#6EE7B7]' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#1E2D4F] bg-[#0D1528] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{item.label}</div>
                <div className={`mt-3 text-2xl font-semibold tracking-[-0.02em] ${item.tone}`}>{fmt(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#10B981]/18 bg-[#10B981]/8 px-5 py-4 text-center sm:flex-row sm:text-left">
            <p className="text-sm leading-7 text-[#CFFAEA]">
              Want your real numbers? The pilot scan is free and read-only.
            </p>
            <Link href="/pilot" className="dashboard-primary-button inline-flex min-h-11 items-center gap-2 px-5 py-3 whitespace-nowrap">
              See the free pilot
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
