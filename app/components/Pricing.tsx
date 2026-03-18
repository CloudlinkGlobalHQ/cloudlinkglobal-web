"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const betaFeatures = [
  "Unlimited deploys tracked",
  "Up to 10 AWS services monitored",
  "Slack + email alerts",
  "Deploy-linked regression reports",
  "Historical cost baseline (90 days)",
  "Priority onboarding support",
];

const futurePlans = [
  { name: "Starter", price: "$49", per: "/mo", desc: "Small teams, up to 3 services" },
  { name: "Growth", price: "$149", per: "/mo", desc: "Up to 20 services + webhooks" },
  { name: "Enterprise", price: "Custom", per: "", desc: "Unlimited services + SLA" },
];

export default function Pricing() {
  return (
    <section className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: E }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-300 mb-4">
          Pricing
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Free during beta</h2>
        <p className="mt-3 mx-auto max-w-xl text-white/50">
          Early access is completely free. Lock in your spot before we launch paid plans.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Beta card — highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: E }}
          className="relative rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-6 overflow-hidden"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
                  Active now
                </div>
                <div className="text-2xl font-bold text-white">Beta Access</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">$0</div>
                <div className="text-xs text-white/35">during beta</div>
              </div>
            </div>

            <p className="mt-3 text-sm text-white/50">
              Full access to all features, no credit card required. We&apos;ll notify you when paid plans launch — early members get a discount.
            </p>

            <ul className="mt-6 space-y-2.5">
              {betaFeatures.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3 text-sm text-white/65"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-400 text-[9px] font-bold">
                    ✓
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>

            <a
              href="#waitlist"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
            >
              Get free beta access →
            </a>
          </div>
        </motion.div>

        {/* Future plans — muted preview */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: E }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-2">Coming after beta</div>
            <h3 className="text-lg font-semibold text-white/70">Paid plans</h3>
            <p className="mt-1.5 text-sm text-white/35">
              Early access members get 40% off launch pricing, locked in forever.
            </p>
          </div>

          <div className="space-y-3">
            {futurePlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-white/50">{plan.name}</div>
                  <div className="text-[11px] text-white/25">{plan.desc}</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white/35">{plan.price}</span>
                  <span className="text-xs text-white/20">{plan.per}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-indigo-500/15 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-300/60">
            Lock in <span className="font-semibold text-indigo-300">40% off</span> by joining the waitlist today.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
