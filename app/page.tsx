"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Zap,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  CloudOff,
  Shield,
  BarChart2,
  Cpu,
  X,
  Globe,
  GitBranch,
  Star,
} from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────
import type { Variants } from "framer-motion";
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ─── Chart data ───────────────────────────────────────────────────────────────
const chartData = [
  { time: "6d ago", cost: 2100 },
  { time: "5d ago", cost: 2050 },
  { time: "4d ago", cost: 2180 },
  { time: "3d ago", cost: 2090 },
  { time: "2d ago", cost: 2150 },
  { time: "1d ago", cost: 3890 },
  { time: "now", cost: 2200 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

function SafeAreaPreview({
  height,
  gradientId,
  strokeWidth = 2,
  tooltip = false,
}: {
  height: number;
  gradientId: string;
  strokeWidth?: number;
  tooltip?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ height }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: "#475569", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            {tooltip && (
              <Tooltip
                contentStyle={{
                  background: "#0A0E1A",
                  border: "1px solid rgba(16, 185, 129,0.3)",
                  borderRadius: 8,
                  color: "#F1F5F9",
                  fontSize: 12,
                }}
                formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, "Cost"]}
              />
            )}
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#10B981"
              strokeWidth={strokeWidth}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={tooltip ? { r: 4, fill: "#10B981" } : undefined}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full animate-pulse rounded-xl bg-[#1E2D4F]" />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroDashboardMockup() {
  return (
    <div
      className="relative rounded-2xl border p-5 shadow-2xl"
      style={{
        background: "#141C33",
        borderColor: "rgba(16, 185, 129,0.25)",
        minWidth: 0,
      }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
          payments-service · daily cost
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
        >
          REGRESSION DETECTED
        </span>
      </div>

      {/* Chart */}
      <SafeAreaPreview height={140} gradientId="costGrad" tooltip />

      {/* Savings counter */}
      <div
        className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: "#10B981" }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ background: "#10B981" }}
          />
        </span>
        <span className="text-sm font-bold" style={{ color: "#10B981" }}>
          +$2,340 saved
        </span>
        <span className="text-xs" style={{ color: "#94A3B8" }}>
          this month
        </span>
      </div>

      {/* Deploy card */}
      <div
        className="mt-2 rounded-xl px-3 py-2.5"
        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "#EF4444" }} />
          <div>
            <div className="text-xs font-semibold" style={{ color: "#F1F5F9" }}>
              payments-service deploy{" "}
              <span
                className="rounded px-1 font-mono text-xs"
                style={{ background: "rgba(16, 185, 129,0.15)", color: "#6EE7B7" }}
              >
                #a3f9b2
              </span>
            </div>
            <div className="text-xs" style={{ color: "#EF4444" }}>
              cost +$847/mo detected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 1: Hero ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
      style={{ background: "#0A0E1A" }}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16, 185, 129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "#10B981" }}
      />
      <div
        className="pointer-events-none absolute right-1/4 top-2/3 h-64 w-64 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "#059669" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(16, 185, 129,0.12)",
                  border: "1px solid rgba(16, 185, 129,0.3)",
                  color: "#6EE7B7",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#10B981" }}
                />
                Now in private beta — early access open
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-extrabold leading-[1.05]"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                background: "linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your cloud bill
              <br />
              has a leak.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                We find it in 2 hours.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="max-w-lg text-xl leading-relaxed"
              style={{ color: "#94A3B8" }}
            >
              Cloudlink connects to your AWS, Azure, or GCP account and automatically detects cost
              regressions, idle resources, and misconfigurations — then fixes them. You keep{" "}
              <strong style={{ color: "#10B981" }}>85%</strong> of everything we save.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  boxShadow: "0 8px 32px rgba(16, 185, 129,0.35)",
                }}
              >
                <Zap size={18} />
                Connect Your Cloud Free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: "rgba(16, 185, 129,0.35)",
                  color: "#F1F5F9",
                  background: "rgba(16, 185, 129,0.05)",
                }}
              >
                See How It Works
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Floating stat badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {[
                { label: "$2.3M tracked" },
                { label: "< 2hr detection" },
                { label: "Zero upfront cost" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: "rgba(20,28,51,0.8)",
                    border: "1px solid rgba(16, 185, 129,0.3)",
                    color: "#F1F5F9",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2: Social Proof Bar ─────────────────────────────────────────────
const companies = ["Vercel", "Stripe", "Linear", "Notion", "Figma", "Loom"];

function SocialProofBar() {
  return (
    <section
      className="overflow-hidden py-10"
      style={{ background: "#0F1629", borderTop: "1px solid rgba(16, 185, 129,0.1)", borderBottom: "1px solid rgba(16, 185, 129,0.1)" }}
    >
      <p className="mb-6 text-center text-sm font-medium" style={{ color: "#475569" }}>
        Trusted by engineering teams at...
      </p>
      <div className="relative">
        <div className="flex animate-marquee gap-16 whitespace-nowrap">
          {[...companies, ...companies].map((name, i) => (
            <span
              key={i}
              className="text-lg font-bold tracking-tight"
              style={{ color: "#334155", filter: "grayscale(1)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </section>
  );
}

// ─── SECTION 3: Problem ───────────────────────────────────────────────────────
const problems = [
  {
    icon: Clock,
    color: "#F59E0B",
    title: "The bill arrives weeks after the deploy",
    desc: "By the time Cost Explorer shows you the damage, the regression has been running for 20 days.",
  },
  {
    icon: AlertTriangle,
    color: "#EF4444",
    title: "Cost Explorer shows what — not why",
    desc: "You see the number go up. You don't see which deploy, which service, or which engineer caused it.",
  },
  {
    icon: TrendingUp,
    color: "#F59E0B",
    title: "By the time you notice, it's already cost you thousands",
    desc: "Idle dev environments, over-provisioned RDS, forgotten Lambda — all quietly draining your budget.",
  },
];

function ProblemSection() {
  return (
    <section className="py-24" style={{ background: "#0A0E1A" }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-4 text-4xl font-extrabold md:text-5xl"
            style={{ color: "#F1F5F9" }}
          >
            Your team ships fast.
            <br />
            <span style={{ color: "#94A3B8" }}>Your cloud bill catches up later.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg" style={{ color: "#94A3B8" }}>
            By the time you open Cost Explorer, the damage is done.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "#141C33",
                border: "1px solid #1E2D4F",
              }}
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${p.color}15` }}
              >
                <p.icon size={22} style={{ color: p.color }} />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: "#F1F5F9" }}>
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 4: How It Works ──────────────────────────────────────────────────
const steps = [
  {
    num: "1",
    title: "Connect",
    desc: "One-click read-only IAM role. No agents. No write access. Takes 5 minutes.",
  },
  {
    num: "2",
    title: "Learn",
    desc: "Cloudlink builds cost baselines per service, per deploy, per environment. No configuration required.",
  },
  {
    num: "3",
    title: "Save",
    desc: "Real-time alerts with deploy attribution. We fix it, you keep 85%. Pay nothing until we save you money.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: "#0F1629" }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 text-4xl font-extrabold md:text-5xl" style={{ color: "#F1F5F9" }}>
            Three steps.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Zero risk.
            </span>
          </h2>
        </motion.div>

        <div className="relative mx-auto max-w-2xl">
          {/* Vertical line */}
          <div
            className="absolute left-7 top-12 bottom-12 w-px"
            style={{ background: "linear-gradient(180deg, #10B981 0%, #059669 100%)" }}
          />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-8"
              >
                {/* Number badge */}
                <div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    boxShadow: "0 4px 20px rgba(16, 185, 129,0.4)",
                  }}
                >
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className="mb-2 text-2xl font-bold" style={{ color: "#F1F5F9" }}>
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: "#94A3B8" }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: Features Bento Grid ──────────────────────────────────────────
function FeaturesBentoSection() {
  return (
    <section className="py-24" style={{ background: "#0A0E1A" }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-4xl font-extrabold md:text-5xl" style={{ color: "#F1F5F9" }}>
            Everything your team needs
            <br />
            <span style={{ color: "#94A3B8" }}>to stop cloud waste</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Large card 1: Deploy-Linked Regression */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="col-span-1 rounded-2xl p-6 md:col-span-2 lg:col-span-2"
            style={{
              background: "#141C33",
              border: "1px solid #1E2D4F",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(16, 185, 129,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1E2D4F";
            }}
          >
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold"
              style={{ background: "rgba(16, 185, 129,0.15)", color: "#6EE7B7" }}
            >
              <TrendingUp size={12} />
              Core Feature
            </div>
            <h3 className="mb-1 text-xl font-bold" style={{ color: "#F1F5F9" }}>
              Deploy-Linked Regression Detection
            </h3>
            <p className="mb-4 text-sm" style={{ color: "#94A3B8" }}>
              Every cost spike is linked to the exact deploy that caused it. Git SHA, timestamp, and cost delta.
            </p>
            <SafeAreaPreview height={110} gradientId="bento1Grad" />
          </motion.div>

          {/* Large card 2: AI Auto-Remediation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="col-span-1 rounded-2xl p-6"
            style={{
              background: "#141C33",
              border: "1px solid #1E2D4F",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(16, 185, 129,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1E2D4F";
            }}
          >
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold"
              style={{ background: "rgba(5, 150, 105,0.15)", color: "#34D399" }}
            >
              <Zap size={12} />
              AI-Powered
            </div>
            <h3 className="mb-2 text-xl font-bold" style={{ color: "#F1F5F9" }}>
              AI Auto-Remediation
            </h3>
            <p className="mb-4 text-sm" style={{ color: "#94A3B8" }}>
              Claude-powered analysis suggests and applies fixes automatically with your approval.
            </p>
            {/* Fake AI card */}
            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(16, 185, 129,0.07)", border: "1px solid rgba(16, 185, 129,0.2)" }}
            >
              <div className="mb-1 text-xs font-semibold" style={{ color: "#6EE7B7" }}>
                AI Suggestion · payments-service
              </div>
              <p className="mb-2 text-xs" style={{ color: "#94A3B8" }}>
                Reduce Lambda memory from 2048MB → 512MB. Cost savings: ~$640/mo. Confidence: 94%.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-lg px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
                >
                  Apply fix
                </button>
                <button
                  className="rounded-lg border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: "#1E2D4F", color: "#94A3B8" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>

          {/* Small cards */}
          {[
            { icon: CloudOff, title: "AutoStopping", desc: "Kill idle dev/staging resources automatically on a schedule.", color: "#10B981" },
            { icon: Shield, title: "Budget Guardrails", desc: "Hard limits per team, service, or environment. Alerts before overage.", color: "#F59E0B" },
            { icon: BarChart2, title: "Unit Cost Economics", desc: "Cost per API call, per user, per transaction — normalized metrics.", color: "#10B981" },
            { icon: Cpu, title: "MCP Server Integration", desc: "Ask your AI assistant about cloud costs directly in Cursor or Claude.", color: "#34D399" },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="rounded-2xl p-5"
              style={{
                background: "#141C33",
                border: "1px solid #1E2D4F",
                transition: "border-color 0.2s, transform 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(16, 185, 129,0.5)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#1E2D4F";
                el.style.transform = "translateY(0)";
              }}
            >
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${feat.color}15` }}
              >
                <feat.icon size={20} style={{ color: feat.color }} />
              </div>
              <h3 className="mb-1 text-base font-bold" style={{ color: "#F1F5F9" }}>
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6: Savings Calculator ───────────────────────────────────────────
function CalculatorSection() {
  const [spend, setSpend] = useState(50000);

  const waste = spend * 0.2;
  const savings = waste * 0.85;
  const fee = savings * 0.15;
  const netSavings = savings * 0.85;

  return (
    <section className="py-24" style={{ background: "#0F1629" }}>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mb-3 text-4xl font-extrabold md:text-5xl" style={{ color: "#F1F5F9" }}>
            See how much you could save
          </h2>
          <p className="mb-10 text-lg" style={{ color: "#94A3B8" }}>
            Adjust your monthly cloud spend and see your savings instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl p-8"
          style={{ background: "#141C33", border: "1px solid #1E2D4F" }}
        >
          {/* Slider */}
          <div className="mb-8">
            <div className="mb-3 flex items-baseline justify-between">
              <label className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
                Monthly AWS Spend
              </label>
              <span className="text-2xl font-extrabold" style={{ color: "#F1F5F9" }}>
                {fmt(spend)}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="w-full accent-emerald-500"
              style={{ accentColor: "#10B981" }}
            />
            <div className="mt-1 flex justify-between text-xs" style={{ color: "#475569" }}>
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
          </div>

          {/* Results grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Estimated waste (20%)", value: waste },
              { label: "Recoverable savings (85% of waste)", value: savings },
              { label: "Cloudlink fee (15%)", value: fee },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1E2D4F" }}
              >
                <div className="mb-1 text-xs font-medium" style={{ color: "#475569" }}>
                  {row.label}
                </div>
                <div className="text-xl font-bold" style={{ color: "#94A3B8" }}>
                  {fmt(row.value)}
                </div>
              </div>
            ))}

            {/* Net savings — highlighted */}
            <div
              className="rounded-xl p-4 sm:col-span-1"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <div className="mb-1 text-xs font-medium" style={{ color: "#6EE7B7" }}>
                Your net savings / month
              </div>
              <div className="text-2xl font-extrabold" style={{ color: "#10B981" }}>
                {fmt(netSavings)}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-base font-bold transition-all duration-200 hover:gap-3"
              style={{ color: "#10B981" }}
            >
              Start saving this month
              <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 7: Integrations ──────────────────────────────────────────────────
const integrations = [
  { name: "AWS", dot: "#FF9900" },
  { name: "Azure", dot: "#0078D4" },
  { name: "GCP", dot: "#4285F4" },
  { name: "Slack", dot: "#4A154B" },
  { name: "GitHub", dot: "#F1F5F9" },
  { name: "Terraform", dot: "#7B42BC" },
  { name: "Datadog", dot: "#632CA6" },
  { name: "PagerDuty", dot: "#06AC38" },
  { name: "Claude", dot: "#CC785C" },
  { name: "Cursor", dot: "#F1F5F9" },
  { name: "Linear", dot: "#5E6AD2" },
  { name: "Vercel", dot: "#F1F5F9" },
];

function IntegrationsSection() {
  return (
    <section className="py-24" style={{ background: "#0A0E1A" }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-extrabold md:text-5xl" style={{ color: "#F1F5F9" }}>
            Works with your entire stack
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
        >
          {integrations.map((int) => (
            <motion.div
              key={int.name}
              variants={fadeUp}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "#141C33",
                border: "1px solid #1E2D4F",
                color: "#F1F5F9",
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: int.dot }}
              />
              {int.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 8: Testimonials ──────────────────────────────────────────────────
const testimonials = [
  {
    quote:
      "Cloudlink caught a Lambda regression within 45 minutes of deploy. Saved us $12K that month alone.",
    name: "Sarah Chen",
    role: "Platform Engineer",
    company: "Fintech startup",
    initials: "SC",
    color: "#10B981",
  },
  {
    quote:
      "We had no idea our dev environments were burning $8K/month overnight. AutoStopping fixed it in a day.",
    name: "Marcus Rodriguez",
    role: "VP Engineering",
    company: "SaaS Co",
    initials: "MR",
    color: "#059669",
  },
  {
    quote:
      "The deploy attribution is insane. We can see exactly which PR caused the cost spike.",
    name: "Priya Patel",
    role: "CTO",
    company: "E-commerce platform",
    initials: "PP",
    color: "#10B981",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24" style={{ background: "#0F1629" }}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-4xl font-extrabold md:text-5xl" style={{ color: "#F1F5F9" }}>
            Teams that stopped the leak
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="rounded-2xl p-6"
              style={{ background: "#141C33", border: "1px solid #1E2D4F" }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: "#475569" }}>
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 9: Final CTA ─────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section
      className="py-28 text-center"
      style={{
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl px-6"
      >
        <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
          Stop paying for waste
          <br />
          you haven&apos;t found yet.
        </h2>
        <p className="mb-8 text-lg text-emerald-100">
          Connect in 5 minutes. First savings report in 24 hours.
          <br />
          Pay nothing until we save you money.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-3 rounded-xl bg-white px-9 py-4 text-lg font-bold shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-3xl"
          style={{ color: "#10B981" }}
        >
          <Zap size={20} />
          Connect Your Cloud — It&apos;s Free
        </Link>
      </motion.div>
    </section>
  );
}

// ─── SECTION 10: Footer ───────────────────────────────────────────────────────
const footerCols = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
  },
  {
    heading: "Company",
    links: ["About", "Customers", "Careers", "Press", "Contact"],
  },
  {
    heading: "Resources",
    links: ["Docs", "API Reference", "Guides", "Community", "Support"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
  },
];

function Footer() {
  return (
    <footer style={{ background: "#080C17", borderTop: "1px solid #141C33" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm transition-colors duration-150 hover:text-white"
                      style={{ color: "#475569" }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: "#141C33" }}
        >
          {/* Left: copyright + badge */}
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: "#334155" }}>
              © 2025 Cloudlink Global
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10B981",
              }}
            >
              SOC 2 in progress
            </span>
          </div>

          {/* Right: social icons */}
          <div className="flex items-center gap-4">
            {[
              { Icon: X, href: "#" },
              { Icon: Globe, href: "#" },
              { Icon: GitBranch, href: "#" },
            ].map(({ Icon, href }, i) => (
              <Link
                key={i}
                href={href}
                className="transition-colors duration-150 hover:text-white"
                style={{ color: "#334155" }}
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main style={{ background: "#0A0E1A", color: "#F1F5F9" }}>
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesBentoSection />
      <CalculatorSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
