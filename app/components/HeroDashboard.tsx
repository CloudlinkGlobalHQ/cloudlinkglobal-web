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
      className="relative w-full max-w-5xl mx-auto mt-14"
    >
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-green-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-[#0b1220] shadow-2xl shadow-slate-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_34%)]" />

        <div className="relative flex items-center gap-2 border-b border-slate-800 bg-slate-950/70 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Cloudlink command center
          </span>
        </div>

        <div className="relative grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-slate-800/80 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 pt-4 pb-3">
              <div>
                <div className="text-sm font-semibold text-white">Deploy-linked regressions</div>
                <div className="mt-0.5 text-[11px] text-slate-400">Last 24 hours · 4 deploys tracked · AWS + Kubernetes</div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-200">
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                2 active alerts
              </span>
            </div>

            <div className="grid grid-cols-[1fr_72px_60px_96px_64px_56px] gap-0 bg-slate-950/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Service</span><span>Deploy</span><span>Change</span><span>Est. impact</span><span>Signal</span><span className="text-right">Time</span>
            </div>

            <div className="divide-y divide-slate-800/70">
              {rows.map((row, i) => (
                <motion.div
                  key={row.service}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.07, ease: E }}
                  className={[
                    "grid grid-cols-[1fr_72px_60px_96px_64px_56px] gap-0 items-center px-5 py-3 text-xs",
                    row.status === "critical"
                      ? "bg-rose-500/8"
                      : row.status === "spike"
                        ? "bg-amber-400/6"
                        : "bg-transparent",
                  ].join(" ")}
                >
                  <span className="font-mono text-[11px] font-medium text-slate-100">{row.service}</span>
                  <span className="font-mono text-[10px] text-slate-500">{row.deploy}</span>
                  <span className={
                    row.change.startsWith("+")
                      ? row.status === "critical" ? "font-bold text-rose-300"
                      : row.status === "spike" ? "font-semibold text-amber-300"
                      : "text-slate-400"
                    : "font-semibold text-emerald-300"
                  }>{row.change}</span>
                  <span className={row.status === "critical" ? "font-semibold text-rose-200" : row.status === "spike" ? "text-amber-200" : "text-emerald-300"}>
                    {row.impact}
                  </span>
                  <Sparkline spike={row.status === "critical" || row.status === "spike"} />
                  <span className="text-right text-[10px] text-slate-500">{row.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Live signals</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[11px] text-slate-500">Monthly risk</div>
                  <div className="mt-1 text-xl font-semibold text-white">$12.8k</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[11px] text-slate-500">Budgets at risk</div>
                  <div className="mt-1 text-xl font-semibold text-white">3</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[11px] text-slate-500">Clouds connected</div>
                  <div className="mt-1 text-xl font-semibold text-white">3</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[11px] text-slate-500">AutoFix ready</div>
                  <div className="mt-1 text-xl font-semibold text-white">2</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Platform status</div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  healthy
                </div>
              </div>
              <div className="mt-3 space-y-3 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>AWS us-east-1</span>
                  <span className="text-slate-500">Cost Explorer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Deploy correlation</span>
                  <span className="text-slate-500">GitHub Actions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Alert delivery</span>
                  <span className="text-slate-500">Slack + webhook</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-slate-800 bg-slate-950/50 px-5 py-3">
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>AWS us-east-1</span><span>·</span><span>Cost Explorer API</span><span>·</span>
            <span className="flex items-center gap-1">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
          <div className="text-[10px] text-slate-600">Updated just now</div>
        </div>
      </div>
    </motion.div>
  );
}
