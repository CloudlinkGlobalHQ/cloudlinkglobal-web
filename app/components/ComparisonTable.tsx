"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

type CellValue = boolean | "paid";

const rows: { feature: string; cloudlink: CellValue; costExplorer: CellValue; datadog: CellValue }[] = [
  { feature: "Ties cost spikes to specific deploys",   cloudlink: true,   costExplorer: false,   datadog: false  },
  { feature: "Per-service cost baselines",              cloudlink: true,   costExplorer: false,   datadog: "paid" },
  { feature: "Estimated monthly $ impact per alert",   cloudlink: true,   costExplorer: false,   datadog: false  },
  { feature: "Read-only — no write access needed",     cloudlink: true,   costExplorer: true,    datadog: false  },
  { feature: "Slack / webhook alerts on detection",    cloudlink: true,   costExplorer: false,   datadog: "paid" },
  { feature: "Setup in under 5 minutes",               cloudlink: true,   costExplorer: true,    datadog: false  },
  { feature: "No agents or code changes required",     cloudlink: true,   costExplorer: true,    datadog: false  },
  { feature: "Performance-based — pay only on savings", cloudlink: true,   costExplorer: false,   datadog: false  },
];

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-green-100 border border-green-300" : "bg-gray-100 border border-gray-200"}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke={highlight ? "#16a34a" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  if (value === "paid")
    return (
      <div className="flex justify-center">
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Paid only</span>
      </div>
    );
  return (
    <div className="flex justify-center">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 2l4 4M6 2L2 6" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default function ComparisonTable() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: E }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-4">
            Compare
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Why not just use what you have?</h2>
          <p className="mt-3 mx-auto max-w-xl text-gray-500">
            AWS Cost Explorer shows trends. Datadog monitors metrics. Neither connects the cost spike to the deploy that caused it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: E }}
          className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_130px_150px_120px] bg-gray-50 border-b border-gray-200">
            <div className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Feature</div>
            <div className="px-4 py-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-600 px-3 py-1 text-xs font-bold text-white">Cloudlink</span>
            </div>
            <div className="px-4 py-4 text-center text-xs font-semibold text-gray-500">AWS Cost Explorer</div>
            <div className="px-4 py-4 text-center text-xs font-semibold text-gray-500">Datadog</div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`grid grid-cols-[1fr_130px_150px_120px] items-center ${i < rows.length - 1 ? "border-b border-gray-100" : ""} ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
            >
              <div className="px-5 py-3.5 text-sm text-gray-700">{row.feature}</div>
              <div className="px-4 py-3.5"><Cell value={row.cloudlink} highlight /></div>
              <div className="px-4 py-3.5"><Cell value={row.costExplorer} /></div>
              <div className="px-4 py-3.5"><Cell value={row.datadog} /></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
