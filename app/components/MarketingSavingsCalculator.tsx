'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'

function fmt(value: number) {
  return `$${Math.round(value).toLocaleString()}`
}

export default function MarketingSavingsCalculator() {
  const [spend, setSpend] = useState(50000)

  const values = useMemo(() => {
    const waste = spend * 0.2
    const recoverable = waste * 0.85
    const cloudlinkFee = recoverable * 0.15
    const netSavings = recoverable * 0.85

    return { waste, recoverable, cloudlinkFee, netSavings }
  }, [spend])

  return (
    <section className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Savings model</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Estimate the savings case in under a minute.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            Adjust monthly cloud spend and see how Cloudlink’s verified-savings model could translate into retained budget.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#1E2D4F] bg-[#10182E] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <div className="mb-8">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label htmlFor="marketing-spend-range" className="text-sm font-semibold text-[#CBD5E1]">
                Monthly cloud spend
              </label>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">Current input</div>
                <div className="text-3xl font-bold tracking-[-0.03em] text-[#F8FAFC]">{fmt(spend)}</div>
              </div>
            </div>
            <input
              id="marketing-spend-range"
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={spend}
              onChange={(event) => setSpend(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1E2D4F] accent-emerald-500"
              aria-describedby="marketing-spend-help"
            />
            <div className="mt-3 flex justify-between text-xs text-[#94A3B8]">
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
            <p id="marketing-spend-help" className="mt-3 text-sm text-[#94A3B8]">
              Assumes 20% addressable waste and Cloudlink’s 15% verified-savings fee.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Estimated waste', value: values.waste, tone: 'text-yellow-300' },
              { label: 'Recoverable savings', value: values.recoverable, tone: 'text-blue-300' },
              { label: 'Cloudlink fee', value: values.cloudlinkFee, tone: 'text-slate-200' },
              { label: 'Your retained savings', value: values.netSavings, tone: 'text-[#6EE7B7]' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#1E2D4F] bg-[#0D1528] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">{item.label}</div>
                <div className={`mt-3 text-2xl font-semibold tracking-[-0.02em] ${item.tone}`}>{fmt(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#10B981]/18 bg-[#10B981]/8 px-5 py-4 text-center sm:flex-row sm:text-left">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6EE7B7]">What this means</div>
              <p className="mt-2 text-sm leading-7 text-[#CFFAEA]">
                If Cloudlink validates this level of savings, your team keeps roughly {fmt(values.netSavings)} per month after fees.
              </p>
            </div>
            <Link href="/signup" className="dashboard-primary-button inline-flex min-h-11 items-center gap-2 px-5 py-3 whitespace-nowrap">
              Connect your cloud
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
