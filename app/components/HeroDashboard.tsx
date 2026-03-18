"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rows = [
  { service: "api-service",      deploy: "#247", change: "+18%", impact: "$4,200/mo", status: "spike",    time: "2m ago" },
  { service: "auth-worker",      deploy: "#246", change: "+3%",  impact: "$180/mo",   status: "ok",       time: "1h ago" },
  { service: "image-processor",  deploy: "#245", change: "-2%",  impact: "-$90/mo",   status: "ok",       time: "3h ago" },
  { service: "data-pipeline",    deploy: "#244", change: "+31%", impact: "$8,600/mo", status: "critical", time: "6h ago" },
];

const sparkData = [4, 5, 4, 5, 5, 7, 9, 12, 14, 18];

function Sparkline({ spike }: { spike?: boolean }) {
  const max = Math.max(...sparkData);
  const w = 64, h = 28;
  const points = sparkData.map((v, i) => `${(i / (sparkData.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={points} fill="none"
        stroke={spike ? "#ef4444" : "#16a34a"} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {spike && (
        <circle cx={(9 / (sparkData.length - 1)) * w} cy={h - (sparkData[9] / max) * h}
          r="2.5" fill="#ef4444" />
      )}
    </svg>
  );
}

export default function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.7, ease: E }}
      className="relative w-full max-w-3xl mx-auto mt-12"
    >
      {/* Subtle shadow glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-green-500/5 blur-2xl" />

      <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xl shadow-gray-200/80">
        {/* Titlebar */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <span className="h-3 w-3 rounded-full bg-green-400/70" />
          <span className="ml-3 text-[11px] text-gray-400 font-mono">cloudlink.app / cost-regressions</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div>
            <div className="text-sm font-semibold text-gray-900">Cost Regressions</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Last 24 hours · 4 deploys tracked</div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-red-500" />
            2 alerts
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_72px_60px_88px_64px_56px] gap-0 text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-5 py-2 bg-gray-50/60">
          <span>Service</span><span>Deploy</span><span>Change</span><span>Est. Impact</span><span>Signal</span><span className="text-right">Time</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {rows.map((row, i) => (
            <motion.div
              key={row.service}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + i * 0.07, ease: E }}
              className={[
                "grid grid-cols-[1fr_72px_60px_88px_64px_56px] gap-0 items-center px-5 py-2.5 text-xs",
                row.status === "critical" ? "bg-red-50/50" : row.status === "spike" ? "bg-amber-50/40" : "",
              ].join(" ")}
            >
              <span className="font-mono text-[11px] text-gray-700 font-medium">{row.service}</span>
              <span className="font-mono text-[10px] text-gray-400">{row.deploy}</span>
              <span className={
                row.change.startsWith("+")
                  ? row.status === "critical" ? "text-red-600 font-bold"
                  : row.status === "spike" ? "text-amber-600 font-semibold"
                  : "text-gray-500"
                : "text-green-600 font-semibold"
              }>{row.change}</span>
              <span className={row.status === "critical" ? "text-red-600 font-semibold" : row.status === "spike" ? "text-amber-600" : "text-green-600"}>
                {row.impact}
              </span>
              <Sparkline spike={row.status === "critical" || row.status === "spike"} />
              <span className="text-right text-gray-300 text-[10px]">{row.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer bar */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span>AWS us-east-1</span><span>·</span><span>Cost Explorer API</span><span>·</span>
            <span className="flex items-center gap-1">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          </div>
          <div className="text-[10px] text-gray-300">Updated just now</div>
        </div>
      </div>
    </motion.div>
  );
}
