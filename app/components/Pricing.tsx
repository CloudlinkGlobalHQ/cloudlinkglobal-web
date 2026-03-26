"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Typical cloud waste rates by spend tier (conservative estimates)
function estimateSavings(monthlySpend: number): number {
  if (monthlySpend <= 0) return 0;
  // Industry average: 30-35% of cloud spend is waste. We use 28% to stay conservative.
  return Math.round(monthlySpend * 0.28);
}

export default function Pricing() {
  const [spend, setSpend] = useState("");

  const spendNum = parseFloat(spend.replace(/,/g, "")) || 0;
  const estimatedSavings = estimateSavings(spendNum);
  const ourCut = Math.round(estimatedSavings * 0.15);
  const yourNet = estimatedSavings - ourCut;

  const formatUSD = (n: number) =>
    n >= 1000
      ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k"
      : "$" + n.toLocaleString();

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: E }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            We only get paid when<br className="hidden sm:block" /> you save money
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-lg text-gray-500">
            15% of confirmed savings. Zero if we save you zero. That&apos;s it.
          </p>
        </motion.div>

        {/* Three pillars */}
        <div className="grid gap-5 md:grid-cols-3 mb-14">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              ),
              title: "Free to connect",
              desc: "Link your AWS, Azure, or GCP account in minutes. We start scanning immediately. No credit card, no commitment.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="9"/><path d="M11 7v4l3 3"/>
                </svg>
              ),
              title: "We find and fix waste",
              desc: "Cloudlink detects idle resources, cost regressions, misconfigurations, and overspending — then acts on them automatically.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="11" y1="1" x2="11" y2="21"/><path d="M17 5H8.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              ),
              title: "You keep 85%",
              desc: "Once savings are verified, we invoice 15% of what we saved you. If we saved you nothing, you owe nothing.",
            },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: E }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-green-600 mb-4">
                {p.icon}
              </div>
              <div className="text-base font-semibold text-gray-900">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Savings Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: E }}
          className="rounded-2xl border border-green-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="border-b border-green-100 bg-green-50/60 px-6 py-4 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-800">Savings Calculator</span>
            <span className="ml-2 text-xs text-green-600">— see what this looks like for your bill</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your monthly cloud spend (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    placeholder="e.g. 50,000"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all duration-200"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Based on industry averages, ~28% of cloud spend is recoverable waste.
                </p>

                {/* Quick picks */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[10000, 25000, 50000, 100000, 250000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSpend(v.toLocaleString())}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-150"
                    >
                      ${(v / 1000).toFixed(0)}k/mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div className={`rounded-xl border transition-all duration-300 ${spendNum > 0 ? "border-green-200 bg-green-50/50" : "border-gray-100 bg-gray-50"} p-5`}>
                {spendNum > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Estimated recoverable savings</div>
                      <div className="text-3xl font-bold text-gray-900">{formatUSD(estimatedSavings)}<span className="text-base font-medium text-gray-400">/mo</span></div>
                    </div>
                    <div className="h-px bg-green-100" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">You keep (85%)</div>
                        <div className="text-xl font-bold text-green-700">{formatUSD(yourNet)}<span className="text-sm font-medium text-green-500">/mo</span></div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Cloudlink fee (15%)</div>
                        <div className="text-xl font-bold text-gray-700">{formatUSD(ourCut)}<span className="text-sm font-medium text-gray-400">/mo</span></div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs text-green-700">
                      You save <strong>{formatUSD(yourNet)}/mo</strong> net — only if Cloudlink actually delivers it.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                      <line x1="16" y1="4" x2="16" y2="28"/><path d="M22 8H13a4 4 0 000 8h6a4 4 0 010 8H10"/>
                    </svg>
                    <p className="text-sm text-gray-400">Enter your monthly spend to see your numbers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Zero risk callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: E }}
          className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="text-sm font-bold text-white mb-1">Zero risk. Completely free until we deliver.</div>
            <p className="text-sm text-slate-400 max-w-lg">
              No subscriptions. No monthly fees. No upfront cost. Connect your cloud, let us work —
              if we don&apos;t save you money, you pay nothing. Ever.
            </p>
          </div>
          <a
            href="#waitlist"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-green-900/30"
          >
            Connect your cloud
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h8M7 3l4 4-4 4"/>
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
