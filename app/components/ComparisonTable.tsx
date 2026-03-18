"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

type CellValue = boolean | "paid";

const rows: { feature: string; cloudlink: CellValue; costExplorer: CellValue; datadog: CellValue }[] = [
  {
    feature: "Ties cost spikes to specific deploys",
    cloudlink: true,
    costExplorer: false,
    datadog: false,
  },
  {
    feature: "Per-service cost baselines",
    cloudlink: true,
    costExplorer: false,
    datadog: "paid",
  },
  {
    feature: "Estimated monthly impact per regression",
    cloudlink: true,
    costExplorer: false,
    datadog: false,
  },
  {
    feature: "Read-only — no write access needed",
    cloudlink: true,
    costExplorer: true,
    datadog: false,
  },
  {
    feature: "Slack / webhook alerts on detection",
    cloudlink: true,
    costExplorer: false,
    datadog: "paid",
  },
  {
    feature: "Setup in under 5 minutes",
    cloudlink: true,
    costExplorer: true,
    datadog: false,
  },
  {
    feature: "Free during beta",
    cloudlink: true,
    costExplorer: true,
    datadog: false,
  },
];

function Cell({ value }: { value: boolean | "paid" }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  if (value === "paid")
    return (
      <div className="flex justify-center">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
          Paid
        </span>
      </div>
    );
  return (
    <div className="flex justify-center">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] border border-white/8">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 2l4 4M6 2L2 6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default function ComparisonTable() {
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
          Compare
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Why not just use what you have?
        </h2>
        <p className="mt-3 mx-auto max-w-xl text-white/50">
          AWS Cost Explorer shows trends. Datadog monitors metrics. Neither connects the cost spike to the deploy that caused it.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: E }}
        className="rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_140px_110px] bg-white/[0.03] border-b border-white/8">
          <div className="px-5 py-4 text-xs font-semibold text-white/40 uppercase tracking-widest">Feature</div>
          <div className="px-4 py-4 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-1">
              <span className="text-xs font-bold text-indigo-300">Cloudlink</span>
            </div>
          </div>
          <div className="px-4 py-4 text-center text-xs font-semibold text-white/35">AWS Cost Explorer</div>
          <div className="px-4 py-4 text-center text-xs font-semibold text-white/35">Datadog</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={[
              "grid grid-cols-[1fr_120px_140px_110px] items-center",
              i < rows.length - 1 ? "border-b border-white/5" : "",
              i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]",
            ].join(" ")}
          >
            <div className="px-5 py-3.5 text-sm text-white/65">{row.feature}</div>
            <div className="px-4 py-3.5">
              <Cell value={row.cloudlink} />
            </div>
            <div className="px-4 py-3.5">
              <Cell value={row.costExplorer} />
            </div>
            <div className="px-4 py-3.5">
              <Cell value={row.datadog} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
