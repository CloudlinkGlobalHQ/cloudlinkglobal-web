"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Mode = "before" | "after";

const data = {
  before: [12, 13, 12, 14, 13, 12, 13],
  after:  [12, 13, 14, 18, 19, 18, 20],
};

function pctChange(before: number[], after: number[]) {
  const b = before.reduce((a, c) => a + c, 0) / before.length;
  const a = after.reduce((x, c) => x + c, 0) / after.length;
  return Math.round(((a - b) / b) * 100);
}

export default function DemoPanel({ cardClass }: { cardClass: string }) {
  const [mode, setMode] = useState<Mode>("after");
  const before = data.before;
  const after = data.after;
  const change = useMemo(() => pctChange(before, after), []);
  const monthlyImpact = useMemo(() => (change > 0 ? change * 220 : 0), [change]);
  const series = mode === "before" ? before : after;
  const max = Math.max(...before, ...after);

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Live demo: deploy-linked cost change</div>
          <div className="mt-1 text-xs text-gray-500">Toggle Before / After and watch the signal shift.</div>
        </div>
        <div className="flex gap-2">
          {(["before", "after"] as const).map((k) => {
            const active = mode === k;
            return (
              <button key={k} type="button" onClick={() => setMode(k)}
                className={["rounded-full px-3 py-1.5 text-xs font-semibold border transition",
                  active ? "bg-green-600 border-green-600 text-white" : "border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700",
                ].join(" ")}>
                {k === "before" ? "Before deploy" : "After deploy"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-500 font-medium">Hourly cost signal</div>
          <div className="text-xs text-gray-400">Last 7 hours</div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 items-end h-24">
          {series.map((v, i) => {
            const isSpike = mode === "after" && i >= 3;
            return (
              <motion.div key={`${mode}-${i}`}
                initial={{ height: 6, opacity: 0.4 }}
                animate={{ height: `${(v / max) * 100}%`, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.04 }}
                className={["rounded-md border",
                  isSpike ? "bg-gradient-to-b from-red-400 to-red-300 border-red-200 shadow-sm shadow-red-200"
                           : "bg-gradient-to-b from-green-500 to-green-400 border-green-300",
                ].join(" ")} />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Deploy window</span>
          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 font-semibold">Regression: +{change}%</span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
            Est. monthly impact: <span className="text-gray-900 font-semibold">+${monthlyImpact.toLocaleString()}</span>
          </span>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-400">(Demo data — your real version links to the exact deploy + service.)</div>
    </div>
  );
}
