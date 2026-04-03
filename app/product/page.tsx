"use client";

import { motion } from "framer-motion";
import {
  GitBranch, Cloud, Cpu, Power, Shield, BarChart2, MessageSquare, Plug, Bell,
  Check, X, ArrowRight,
} from "lucide-react";
import Link from "next/link";


// ── animation ─────────────────────────────────────────────────────────────────
const E: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ── deploy card visual ────────────────────────────────────────────────────────
function DeployCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 font-mono text-sm space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[#94A3B8] text-xs">cloudlink-detector</span>
      </div>
      <div className="text-[#94A3B8]">$ deploy <span className="text-[#10B981]">main</span> → prod</div>
      <div className="text-[#10B981]">✓ Build passed · Hash: <span className="text-[#F1F5F9]">a3f9c12</span></div>
      <div className="text-[#94A3B8]">→ Fingerprinting cost baseline…</div>
      <div className="text-yellow-400">Alert: cost regression detected <span className="text-[#F1F5F9]">+$847/day</span></div>
      <div className="text-[#94A3B8]">  Service: <span className="text-[#F1F5F9]">api-gateway</span></div>
      <div className="text-[#94A3B8]">  Cause: Lambda concurrency spike</div>
      <div className="text-[#10B981]">→ Alert sent to #eng-alerts</div>
      <div className="mt-2 pt-2 border-t border-[#1E2D4F] text-xs text-[#94A3B8]">
        Detected in <span className="text-[#10B981] font-semibold">under 1 hour</span> · 3 verified fixes suggested
      </div>
    </div>
  );
}

// ── scanning visual ───────────────────────────────────────────────────────────
function ScanCard() {
  const clouds = [
    { name: "AWS", color: "#FF9900", status: "Scanning", resources: 1842 },
    { name: "Azure", color: "#0089D6", status: "Scanning", resources: 634 },
    { name: "GCP", color: "#4285F4", status: "Scanning", resources: 291 },
  ];
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="text-xs text-[#94A3B8] font-mono">Continuous scan active</span>
      </div>
      {clouds.map((c) => (
        <div key={c.name} className="flex items-center justify-between bg-[#141C33] border border-[#1E2D4F] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-[#F1F5F9] font-semibold text-sm">{c.name}</span>
          </div>
          <div className="text-right">
            <div className="text-[#10B981] text-xs">{c.status}</div>
            <div className="text-[#94A3B8] text-xs">{c.resources.toLocaleString()} resources</div>
          </div>
        </div>
      ))}
      <div className="text-xs text-[#94A3B8] text-center mt-2">Last scan: 4 min ago · Next: 56 min</div>
    </div>
  );
}

// ── AI remediation visual ─────────────────────────────────────────────────────
function RemediationCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="text-xs text-[#94A3B8] font-mono mb-3">AI Remediation Engine</div>
      {[
        { issue: "Oversized RDS instance (db.r5.2xlarge)", fix: "Downsize to db.r5.large", saving: "$1,240/mo", status: "pending" },
        { issue: "45 unattached EBS volumes", fix: "Snapshot + delete", saving: "$340/mo", status: "approved" },
        { issue: "Old NAT Gateway (2 AZs unused)", fix: "Remove idle gateways", saving: "$180/mo", status: "approved" },
      ].map((item, i) => (
        <div key={i} className="bg-[#141C33] border border-[#1E2D4F] rounded-xl p-3">
          <div className="text-xs text-[#94A3B8] mb-1">{item.issue}</div>
          <div className="flex items-center justify-between">
            <span className="text-[#F1F5F9] text-sm">→ {item.fix}</span>
            <div className="flex items-center gap-2">
              <span className="text-[#10B981] text-xs font-semibold">{item.saving}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#10B981]/10 text-[#10B981]"}`}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AutoStopping visual ───────────────────────────────────────────────────────
function AutoStoppingCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#94A3B8] font-mono">AutoStopping</span>
        <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded-full">Active</span>
      </div>
      {[
        { env: "dev-backend", idle: "4h 12m", status: "Stopped", savings: "$28" },
        { env: "staging-api", idle: "2h 05m", status: "Stopping…", savings: "$14" },
        { env: "qa-frontend", idle: "0m", status: "Active", savings: "$0" },
        { env: "dev-ml-pipeline", idle: "6h 30m", status: "Stopped", savings: "$61" },
      ].map((e, i) => (
        <div key={i} className="flex items-center justify-between bg-[#141C33] border border-[#1E2D4F] rounded-xl px-3 py-2.5">
          <div>
            <div className="text-[#F1F5F9] text-sm font-mono">{e.env}</div>
            <div className="text-[#94A3B8] text-xs">Idle: {e.idle}</div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-semibold ${e.status === "Active" ? "text-[#10B981]" : e.status === "Stopping…" ? "text-yellow-400" : "text-[#94A3B8]"}`}>
              {e.status}
            </div>
            <div className="text-xs text-[#10B981]">{e.savings} saved</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Budget guardrails visual ──────────────────────────────────────────────────
function GuardrailsCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-4">
      <div className="text-xs text-[#94A3B8] font-mono mb-2">Budget Guardrails</div>
      {[
        { service: "api-service", used: 78, limit: 100, color: "#10B981" },
        { service: "data-pipeline", used: 96, limit: 100, color: "#F59E0B" },
        { service: "ml-training", used: 45, limit: 100, color: "#10B981" },
      ].map((s, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#F1F5F9] font-mono">{s.service}</span>
            <span className="text-[#94A3B8]">{s.used}% of ${s.limit}K</span>
          </div>
          <div className="h-2 bg-[#1E2D4F] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${s.used}%` }}
              transition={{ duration: 1, delay: i * 0.15 }}
              className="h-full rounded-full"
              style={{ background: s.color }}
            />
          </div>
        </div>
      ))}
      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
        ⛔ Deploy blocked: data-pipeline would exceed budget by $2.4K
      </div>
    </div>
  );
}

// ── Unit cost SDK visual ──────────────────────────────────────────────────────
function SDKCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 font-mono text-sm space-y-3">
      <div className="text-[#94A3B8] text-xs mb-3">cloudlink-sdk · unit-costs.ts</div>
      <div>
        <span className="text-[#059669]">import</span>
        <span className="text-[#F1F5F9]"> {"{ track }"} </span>
        <span className="text-[#059669]">from</span>
        <span className="text-yellow-300"> &apos;@cloudlink/sdk&apos;</span>
      </div>
      <div className="text-[#94A3B8]">{"// Track cost per API call"}</div>
      <div>
        <span className="text-[#10B981]">track</span>
        <span className="text-[#F1F5F9]">{"({"}</span>
      </div>
      <div className="pl-4 text-[#F1F5F9]">
        unit: <span className="text-yellow-300">&apos;api_call&apos;</span>,<br />
        dimension: userId,<br />
        metadata: {"{ endpoint, region }"}
      </div>
      <div className="text-[#F1F5F9]">{"})"}</div>
      <div className="mt-3 pt-3 border-t border-[#1E2D4F]">
        <div className="text-xs text-[#94A3B8] mb-2">Live unit costs</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs"><span className="text-[#F1F5F9]">Cost / API call</span><span className="text-[#10B981]">$0.000043</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#F1F5F9]">Cost / user / day</span><span className="text-[#10B981]">$0.0142</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#F1F5F9]">Cost / transaction</span><span className="text-[#10B981]">$0.0028</span></div>
        </div>
      </div>
    </div>
  );
}

// ── AI Advisor visual ─────────────────────────────────────────────────────────
function AdvisorCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-4">
      <div className="text-xs text-[#94A3B8] font-mono mb-2">AI Cost Advisor</div>
      {[
        { role: "user", msg: "Why did my bill spike 40% last Tuesday?" },
        { role: "ai", msg: "A deploy at 14:32 UTC pushed api-service Lambda concurrency from 12 to 340. This caused $1,847 in unexpected charges. I've attached a fix — want me to apply it?" },
      ].map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
            m.role === "user"
              ? "bg-[#10B981] text-white rounded-br-sm"
              : "bg-[#141C33] border border-[#1E2D4F] text-[#F1F5F9] rounded-bl-sm"
          }`}>
            {m.msg}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MCP visual ────────────────────────────────────────────────────────────────
function MCPCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 font-mono text-sm space-y-3">
      <div className="text-[#94A3B8] text-xs mb-2">Cursor IDE · Cloudlink MCP</div>
      <div className="text-[#94A3B8]">&gt; <span className="text-[#F1F5F9]">What&apos;s the most expensive service this week?</span></div>
      <div className="bg-[#141C33] border border-[#1E2D4F] rounded-xl p-3 text-xs space-y-1">
        <div className="text-[#10B981] mb-1">Cloudlink MCP · live data</div>
        <div className="flex justify-between"><span className="text-[#94A3B8]">api-gateway</span><span className="text-[#F1F5F9]">$4,821</span></div>
        <div className="flex justify-between"><span className="text-[#94A3B8]">ml-training</span><span className="text-[#F1F5F9]">$3,104</span></div>
        <div className="flex justify-between"><span className="text-[#94A3B8]">data-pipeline</span><span className="text-[#F1F5F9]">$1,892</span></div>
        <div className="mt-2 text-[#10B981]">Suggested: scale down ml-training overnight → save ~$890/wk</div>
      </div>
    </div>
  );
}

// ── Notifications visual ──────────────────────────────────────────────────────
function NotificationsCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="text-xs text-[#94A3B8] font-mono mb-2">Integrations</div>
      {[
        { channel: "Slack #eng-alerts", msg: "Cost regression: +$847/day on api-service", time: "2m ago", dot: "#10B981" },
        { channel: "PagerDuty", msg: "Budget threshold exceeded: data-pipeline 96%", time: "14m ago", dot: "#F59E0B" },
        { channel: "Email digest", msg: "Weekly savings report: $12,400 saved", time: "3h ago", dot: "#10B981" },
        { channel: "Webhook → Datadog", msg: "AutoStopping: dev-backend stopped (idle 4h)", time: "4h ago", dot: "#059669" },
      ].map((n, i) => (
        <div key={i} className="flex items-start gap-3 bg-[#141C33] border border-[#1E2D4F] rounded-xl px-3 py-2.5">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#94A3B8] truncate">{n.channel}</div>
            <div className="text-xs text-[#F1F5F9] mt-0.5 leading-snug">{n.msg}</div>
          </div>
          <div className="text-xs text-[#94A3B8] flex-shrink-0">{n.time}</div>
        </div>
      ))}
    </div>
  );
}

// ── feature data ──────────────────────────────────────────────────────────────
const features = [
  {
    icon: <GitBranch size={22} className="text-[#10B981]" />,
    title: "Deploy-Linked Regression Detection",
    desc: "Connect your CI/CD pipeline and every deploy gets a cost fingerprint. Regressions surface in minutes, not months.",
    bullets: [
      "Automatic baseline per service",
      "Deploy hash attribution",
      "Slack / email alerts",
      "P95 cost monitoring",
    ],
    visual: <DeployCard />,
  },
  {
    icon: <Cloud size={22} className="text-[#059669]" />,
    title: "Automated Cloud Scanning",
    desc: "We scan AWS, Azure, and GCP continuously — not just when you think to check.",
    bullets: [
      "Multi-cloud support",
      "Hourly scans",
      "90-day history",
      "Read-only IAM",
    ],
    visual: <ScanCard />,
  },
  {
    icon: <Cpu size={22} className="text-[#10B981]" />,
    title: "AI-Powered Remediation",
    desc: "Our AI doesn't just detect — it fixes. With your approval.",
    bullets: [
      "Auto-suggested fixes",
      "One-click approval",
      "Rollback support",
      "Evidence attached to every action",
    ],
    visual: <RemediationCard />,
  },
  {
    icon: <Power size={22} className="text-[#10B981]" />,
    title: "AutoStopping",
    desc: "Dev and staging environments left on overnight cost real money. AutoStopping kills them automatically.",
    bullets: [
      "Inactivity detection",
      "Schedule-based stops",
      "Instant restart on traffic",
      "Saves avg $8K/month",
    ],
    visual: <AutoStoppingCard />,
  },
  {
    icon: <Shield size={22} className="text-[#059669]" />,
    title: "Budget Guardrails & Deploy Gates",
    desc: "Block deploys that would exceed budget. Set hard limits per service.",
    bullets: [
      "Per-service budget limits",
      "Deploy gate integration",
      "Slack / CI notifications",
      "Historical spend tracking",
    ],
    visual: <GuardrailsCard />,
  },
  {
    icon: <BarChart2 size={22} className="text-[#10B981]" />,
    title: "Unit Cost Economics SDK",
    desc: "Track cost per API call, per user, per transaction. Build it into your code.",
    bullets: [
      "TypeScript / Python SDK",
      "Custom dimensions",
      "Real-time unit cost dashboard",
      "Cost regression by unit",
    ],
    visual: <SDKCard />,
  },
  {
    icon: <MessageSquare size={22} className="text-[#059669]" />,
    title: "AI Cost Advisor",
    desc: "Ask natural language questions about your cloud spend. Get actionable answers.",
    bullets: [
      "Natural language queries",
      "Root cause attribution",
      "Fix suggestions with evidence",
      "Proactive anomaly alerts",
    ],
    visual: <AdvisorCard />,
  },
  {
    icon: <Plug size={22} className="text-[#10B981]" />,
    title: "MCP Server Integration",
    desc: "Claude, Cursor, and other AI coding tools can now see your cloud costs in real time.",
    bullets: [
      "Works with Claude & Cursor",
      "Live cost context in IDE",
      "Natural language cost queries",
      "Open MCP spec",
    ],
    visual: <MCPCard />,
  },
  {
    icon: <Bell size={22} className="text-[#10B981]" />,
    title: "Notifications & Integrations",
    desc: "Slack, PagerDuty, email, webhooks — wherever your team lives.",
    bullets: [
      "Slack & MS Teams",
      "PagerDuty escalation",
      "Email digests",
      "Custom webhooks",
    ],
    visual: <NotificationsCard />,
  },
];

// ── comparison table data ──────────────────────────────────────────────────────
type RowValue = boolean | string;
const comparisonRows: { feature: string; cloudlink: RowValue; awsCE: RowValue; datadog: RowValue; cloudhealth: RowValue }[] = [
  { feature: "Deploy attribution", cloudlink: true, awsCE: false, datadog: "partial", cloudhealth: false },
  { feature: "Auto-remediation", cloudlink: true, awsCE: false, datadog: false, cloudhealth: false },
  { feature: "Multi-cloud", cloudlink: true, awsCE: false, datadog: true, cloudhealth: true },
  { feature: "AutoStopping", cloudlink: true, awsCE: false, datadog: false, cloudhealth: false },
  { feature: "Performance-based pricing", cloudlink: true, awsCE: false, datadog: false, cloudhealth: false },
  { feature: "MCP integration", cloudlink: true, awsCE: false, datadog: false, cloudhealth: false },
  { feature: "AI Advisor", cloudlink: true, awsCE: false, datadog: "partial", cloudhealth: false },
];

function Cell({ value }: { value: RowValue }) {
  if (value === true) return <Check size={18} className="text-[#10B981] mx-auto" />;
  if (value === false) return <X size={18} className="text-[#94A3B8]/40 mx-auto" />;
  return <span className="text-xs text-[#F59E0B] mx-auto block text-center">Partial</span>;
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-[#F1F5F9]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-4 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
              Product
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            The cloud cost platform that{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              actually does something
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-8">
            Built for engineering and finance teams that need clear cost attribution, enforceable controls, and operational remediation instead of passive reporting.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#059669] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#0F1629] hover:border-[#10B981]/40 px-8 py-3.5 text-sm font-semibold text-[#94A3B8] transition-all duration-200"
            >
              See pricing
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      {features.map((f, i) => {
        const isLeft = i % 2 === 0;
        return (
          <section
            key={i}
            className={`py-20 px-4 ${i % 2 === 1 ? "bg-[#0F1629]" : ""}`}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${!isLeft ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Text block */}
                <motion.div
                  variants={fadeUp}
                  className={`${!isLeft ? "lg:order-2" : "lg:order-1"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#141C33] border border-[#1E2D4F] flex items-center justify-center mb-5">
                    {f.icon}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4">{f.title}</h2>
                  <p className="text-[#94A3B8] text-lg leading-relaxed mb-6">{f.desc}</p>
                  <ul className="space-y-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-[#94A3B8] text-sm">
                        <Check size={15} className="text-[#10B981] flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Visual block */}
                <motion.div
                  variants={fadeUp}
                  className={`${!isLeft ? "lg:order-1" : "lg:order-2"}`}
                >
                  {f.visual}
                </motion.div>
              </motion.div>
            </div>
          </section>
        );
      })}

      {/* ── COMPARISON TABLE ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                Comparison
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">How we stack up</h2>
            </motion.div>

            <motion.div variants={fadeUp} className="overflow-x-auto rounded-3xl border border-[#1E2D4F] bg-[#0A0E1A]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-4 text-[#94A3B8] text-sm font-medium border-b border-[#1E2D4F] w-1/3">Feature</th>
                    {[
                      { name: "Cloudlink", highlight: true },
                      { name: "AWS Cost Explorer", highlight: false },
                      { name: "Datadog", highlight: false },
                      { name: "CloudHealth", highlight: false },
                    ].map((col) => (
                      <th
                        key={col.name}
                        className={`text-center px-6 py-4 text-sm font-semibold border-b border-[#1E2D4F] ${
                          col.highlight
                            ? "text-[#10B981] bg-[#10B981]/5"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {col.name}
                        {col.highlight && (
                          <div className="text-xs font-normal text-[#10B981] mt-0.5">recommended</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[#1E2D4F] hover:bg-[#141C33]/50 transition-colors ${i % 2 === 0 ? "" : "bg-[#141C33]/20"}`}
                    >
                      <td className="px-6 py-4 text-[#F1F5F9] text-sm">{row.feature}</td>
                      <td className="px-6 py-4 bg-[#10B981]/5">
                        <Cell value={row.cloudlink} />
                      </td>
                      <td className="px-6 py-4"><Cell value={row.awsCE} /></td>
                      <td className="px-6 py-4"><Cell value={row.datadog} /></td>
                      <td className="px-6 py-4"><Cell value={row.cloudhealth} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
              Ready to cut cloud waste?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#94A3B8] text-lg mb-8">
              Connect in 5 minutes. No credit card. No commitment.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#059669] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
                Get started free <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
