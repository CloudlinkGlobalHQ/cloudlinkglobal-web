"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Mode = "before" | "after";

const data = {
  before: [12, 13, 12, 14, 13, 12, 13],
  after: [12, 13, 14, 18, 19, 18, 20],
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
          <div className="text-sm font-semibold">Live demo: deploy → cost change</div>
          <div className="mt-1 text-xs text-white/50">
            Toggle “Before / After” and watch the signal shift.
          </div>
        </div>

        <div className="flex gap-2">
          {(["before", "after"] as const).map((k) => {
            const active = mode === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold border transition",
                  active ? "bg-white/10 border-white/25 text-white" : "border-white/15 text-white/70 hover:border-white/25",
                ].join(" ")}
              >
                {k === "before" ? "Before deploy" : "After deploy"}
              </button>
            );
          })}
        </div>
      </div>

      {/* chart */}
      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/60">Hourly cost signal</div>
          <div className="text-xs text-white/60">Last 7 hours</div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 items-end h-28">
          {series.map((v, i) => {
            const isSpike = mode === "after" && i >= 3;
            return (
              <motion.div
                key={`${mode}-${i}`}
                initial={{ height: 6, opacity: 0.4 }}
                animate={{ height: `${(v / max) * 100}%`, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.04 }}
                className={[
                  "rounded-md border",
                  isSpike
                    ? "bg-gradient-to-b from-red-400/60 to-red-600/20 border-red-400/25 shadow-[0_0_12px_rgba(248,113,113,0.2)]"
                    : "bg-gradient-to-b from-indigo-400/50 to-violet-600/20 border-indigo-400/20",
                ].join(" ")}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/15 px-3 py-1">Deploy window</span>
          <span className="rounded-full border border-white/15 px-3 py-1">
            Regression: <span className="text-red-200 font-semibold">+{change}%</span>
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1">
            Est. monthly impact: <span className="text-white font-semibold">+${monthlyImpact.toLocaleString()}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-white/50">
        (Demo data only — your real version will link to the exact deploy + service.)
      </div>
    </div>
  );
}
