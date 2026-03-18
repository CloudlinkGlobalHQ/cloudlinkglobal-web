"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rows = [
  { service: "api-service", deploy: "#247", change: "+18%", impact: "$4,200/mo", status: "spike", time: "2m ago" },
  { service: "auth-worker", deploy: "#246", change: "+3%", impact: "$180/mo", status: "ok", time: "1h ago" },
  { service: "image-processor", deploy: "#245", change: "-2%", impact: "-$90/mo", status: "ok", time: "3h ago" },
  { service: "data-pipeline", deploy: "#244", change: "+31%", impact: "$8,600/mo", status: "critical", time: "6h ago" },
];

const sparkData = [4, 5, 4, 5, 5, 7, 9, 12, 14, 18];

function Sparkline({ spike }: { spike?: boolean }) {
  const max = Math.max(...sparkData);
  const w = 64;
  const h = 28;
  const points = sparkData
    .map((v, i) => `${(i / (sparkData.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={spike ? "#f87171" : "rgba(99,102,241,0.6)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {spike && (
        <circle
          cx={(9 / (sparkData.length - 1)) * w}
          cy={h - (sparkData[9] / max) * h}
          r="2.5"
          fill="#f87171"
        />
      )}
    </svg>
  );
}

export default function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.9, ease: E }}
      className="relative w-full max-w-3xl mx-auto mt-14"
    >
      {/* Glow beneath the card */}
      <div className="pointer-events-none absolute -inset-x-10 -bottom-8 h-32 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent blur-2xl" />

      {/* Dashboard card */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#080818] overflow-hidden shadow-2xl shadow-black/60"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Titlebar */}
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-3 text-[11px] text-white/25 font-mono">cloudlink.app / cost-regressions</span>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div>
            <div className="text-sm font-semibold text-white">Cost Regressions</div>
            <div className="text-[11px] text-white/35 mt-0.5">Last 24 hours · 4 deploys tracked</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-300">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-red-400"
              />
              2 alerts
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="px-2 pb-4">
          <div className="grid grid-cols-[1fr_80px_60px_90px_64px_60px] gap-0 text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">
            <span>Service</span>
            <span>Deploy</span>
            <span>Change</span>
            <span>Est. Impact</span>
            <span>Signal</span>
            <span className="text-right">Time</span>
          </div>

          <div className="space-y-1">
            {rows.map((row, i) => (
              <motion.div
                key={row.service}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + i * 0.08, ease: E }}
                className={[
                  "grid grid-cols-[1fr_80px_60px_90px_64px_60px] gap-0 items-center rounded-xl px-3 py-2.5 text-xs",
                  row.status === "critical"
                    ? "bg-red-500/[0.08] border border-red-500/20"
                    : row.status === "spike"
                    ? "bg-amber-500/[0.06] border border-amber-500/15"
                    : "border border-transparent",
                ].join(" ")}
              >
                <span className="font-medium text-white/80 font-mono text-[11px]">{row.service}</span>
                <span className="text-white/35 font-mono text-[10px]">{row.deploy}</span>
                <span
                  className={
                    row.change.startsWith("+")
                      ? row.status === "critical"
                        ? "text-red-400 font-semibold"
                        : row.status === "spike"
                        ? "text-amber-400 font-semibold"
                        : "text-white/50"
                      : "text-emerald-400 font-semibold"
                  }
                >
                  {row.change}
                </span>
                <span
                  className={
                    row.status === "critical"
                      ? "text-red-300 font-semibold"
                      : row.status === "spike"
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }
                >
                  {row.impact}
                </span>
                <Sparkline spike={row.status === "critical" || row.status === "spike"} />
                <span className="text-right text-white/25 text-[10px]">{row.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="border-t border-white/6 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-white/30">
            <span>AWS us-east-1</span>
            <span>·</span>
            <span>Cost Explorer API</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              />
              Live
            </span>
          </div>
          <div className="text-[10px] text-white/20">Updated just now</div>
        </div>
      </div>
    </motion.div>
  );
}
