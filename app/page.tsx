"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WaitlistForm from "./components/WaitlistForm";
import StickyNav from "./components/StickyNav";
import InteractiveAlert from "./components/InteractiveAlert";
import DemoPanel from "./components/DemoPanel";
import { LogoWordmark } from "./components/Logo";
import TiltCard from "./components/TiltCard";
import AnimatedCounter from "./components/AnimatedCounter";
import HeroDashboard from "./components/HeroDashboard";
import Testimonials from "./components/Testimonials";
import ComparisonTable from "./components/ComparisonTable";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};

const card = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-200";
const primaryBtn = "inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 px-7 py-3 text-sm font-semibold text-white shadow-sm shadow-green-600/20 transition-all duration-200";
const secondaryBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 px-7 py-3 text-sm font-semibold text-gray-700 transition-all duration-200";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700">
      {children}
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: 47,      suffix: "",      label: "Engineering teams on waitlist", prefix: "" },
  { value: 2300000, suffix: "",      label: "In cost regressions tracked",    prefix: "$" },
  { value: 2,       suffix: "h avg", label: "Detection time after deploy",    prefix: "<" },
  { value: 99,      suffix: "%",     label: "Read-only — zero write access",  prefix: "" },
];

const steps = [
  {
    n: "01",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="16" height="8" rx="2"/><path d="M7 11V7a4 4 0 018 0v4"/><circle cx="11" cy="15" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Connect AWS read-only",
    desc: "Create a scoped IAM role using our one-click CloudFormation template. No agents, no credentials, no write access — ever.",
  },
  {
    n: "02",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-8 4 5 3-3 4 6"/><circle cx="18" cy="5" r="2"/>
      </svg>
    ),
    title: "We learn your cost baselines",
    desc: "Cloudlink builds per-service cost baselines automatically. No configuration needed — we handle the pattern detection.",
  },
  {
    n: "03",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    title: "Get instant deploy-linked alerts",
    desc: "See the exact % change, monthly dollar impact, and which deploy triggered it — delivered to Slack or email.",
  },
];

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L2 6l8 4 8-4-8-4z"/><path d="M2 10l8 4 8-4"/><path d="M2 14l8 4 8-4"/>
      </svg>
    ),
    title: "Deploy-linked regression detection",
    desc: "Every cost spike is traced back to the exact deploy window that caused it — not just a noisy account-wide alert.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Read-only by design",
    desc: "We request only Cost Explorer and CloudTrail read permissions. Every call we make is visible in your CloudTrail logs. Zero write access.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    title: "Monthly impact estimates",
    desc: "Each regression alert includes the projected monthly dollar impact so you can triage by cost, not just severity.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.92a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    title: "Slack, email, and webhook alerts",
    desc: "Notifications reach your team instantly — inside your existing workflow. No new dashboard to check.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Per-service baselines",
    desc: "Cost patterns are tracked per service, not account-wide. You get signal, not noise — and no false positives from seasonal traffic.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "5-minute setup",
    desc: "One CloudFormation stack, one IAM role, and you're live. No agents, no code changes, no infrastructure modifications.",
  },
];

const integrations = [
  { name: "AWS ECS",         color: "#FF9900" },
  { name: "AWS Lambda",      color: "#FF9900" },
  { name: "AWS RDS",         color: "#FF9900" },
  { name: "CloudTrail",      color: "#FF9900" },
  { name: "Cost Explorer",   color: "#FF9900" },
  { name: "Slack",           color: "#4A154B" },
  { name: "GitHub Actions",  color: "#24292F" },
  { name: "PagerDuty",       color: "#06AC38" },
  { name: "Webhook",         color: "#6B7280" },
  { name: "Email / SMTP",    color: "#6B7280" },
];

const security = [
  { title: "Read-only IAM role", desc: "Scoped to Cost Explorer and CloudTrail read permissions only. No S3, no EC2, no write access of any kind." },
  { title: "No application logs", desc: "We never access your application logs, database contents, or any customer data. Only aggregated AWS cost signals." },
  { title: "Auditable via CloudTrail", desc: "Every API call Cloudlink makes is logged in your own AWS CloudTrail. Nothing is hidden from your security team." },
  { title: "Revocable in one step", desc: "Delete the IAM role at any time to immediately and permanently cut off all Cloudlink access to your account." },
  { title: "Encrypted data at rest", desc: "Cost baseline data is stored encrypted. We follow AES-256 encryption standards for all stored customer data." },
  { title: "SOC 2 (in progress)", desc: "We are actively pursuing SOC 2 Type II certification. Enterprise customers get access to our security documentation." },
];

const navItems = [
  { id: "how",      label: "How it works" },
  { id: "features", label: "Features" },
  { id: "demo",     label: "Demo" },
  { id: "pricing",  label: "Pricing" },
  { id: "security", label: "Security" },
  { id: "waitlist", label: "Get access" },
];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <StickyNav items={navItems} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} id="top" className="relative overflow-hidden bg-white pt-16 pb-8">
        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
        {/* Green radial wash */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-green-500/8 blur-3xl" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 mx-auto max-w-6xl px-6">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: E }}
            className="flex justify-center mb-8">
            <a href="#waitlist" className="group inline-flex items-center gap-2.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Now accepting early access applications
              <span className="text-green-500 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </a>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: E }}
            className="mx-auto max-w-4xl text-center text-5xl font-bold tracking-tight leading-[1.08] text-gray-900 md:text-6xl lg:text-7xl">
            Know instantly when a deploy{" "}
            <span className="text-gradient">costs you money</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: E }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-500">
            Cloudlink correlates AWS cost changes to specific deploys — per service, per deploy window.
            Catch expensive regressions in under 2 hours, before the bill compounds.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: E }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#waitlist" className={primaryBtn}>
              Get early access — it&apos;s free →
            </a>
            <a href="#how" className={secondaryBtn}>
              See how it works ↓
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["Read-only AWS access", "No agents or code changes", "5-minute setup", "Free during beta"].map((t) => (
              <span key={t} className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-500">
                <span className="mr-1.5 text-green-500">✓</span>{t}
              </span>
            ))}
          </motion.div>

          {/* Hero dashboard */}
          <HeroDashboard />
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08, ease: E }}
                className="text-center">
                <div className="text-3xl font-bold text-gray-900 tracking-tight">
                  <AnimatedCounter end={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs text-gray-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS STRIP ───────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-5 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Built for teams running on
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {integrations.map((s, i) => (
              <motion.span key={s.name} initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.04, ease: E }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:border-green-200 hover:text-green-700 transition-all duration-150 cursor-default">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E }} className="text-center mb-14">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Your AWS bill grew 40% last quarter.<br />Which deploy caused it?
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-gray-500 text-lg">
              Cost Explorer shows you the spike. CloudWatch shows you the metrics. But nothing connects the two
              to the specific deploy that changed everything — until Cloudlink.
            </p>
          </motion.div>

          {/* Problem / Solution side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, ease: E }}
              className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 border border-red-200">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <span className="text-sm font-bold text-red-700">Without Cloudlink</span>
              </div>
              <ul className="space-y-3">
                {[
                  "AWS bill spikes — you open Cost Explorer",
                  "You see the cost went up. You don't know why.",
                  "You spend hours cross-referencing deploy logs",
                  "By the time you find the culprit, you've paid for 2 weeks",
                  "Next month — same problem, different service",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-red-800">
                    <span className="mt-0.5 shrink-0 text-red-400">✗</span>{t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* With */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, ease: E }}
              className="rounded-2xl border border-green-200 bg-green-50/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 border border-green-200">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-sm font-bold text-green-700">With Cloudlink</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Deploy #247 hits production at 3:42pm",
                  "2 hours later — Cloudlink detects a cost regression",
                  "Slack alert: api-service is up +18%, est. $4,200/mo",
                  "Your team investigates the exact deploy, not everything",
                  "Fixed the same day. Bill impact: minimal.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-green-800">
                    <span className="mt-0.5 shrink-0 text-green-500">✓</span>{t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <motion.div variants={item} className="mb-14 text-center">
              <SectionLabel>How it works</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Three steps to deploy-aware cost tracking
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-gray-500">
                Connect in 5 minutes. We handle everything else automatically.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <motion.div key={s.n} variants={item}>
                  <div className={card + " h-full relative overflow-hidden"}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-green-600">
                        {s.icon}
                      </div>
                      <span className="font-mono text-3xl font-bold text-gray-100 select-none">{s.n}</span>
                    </div>
                    <div className="text-base font-semibold text-gray-900">{s.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                    <div className="mt-5 h-px bg-gray-100">
                      <motion.div className="h-px bg-gradient-to-r from-green-500 to-green-300"
                        initial={{ width: "0%" }} whileInView={{ width: "100%" }} viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3, ease: E }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <motion.div variants={item} className="mb-14 text-center">
              <SectionLabel>Features</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Everything your team needs to own cloud costs
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-gray-500">
                Purpose-built for engineering teams — not finance dashboards.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <motion.div key={f.title} variants={item}>
                  <TiltCard className={card + " h-full"}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-200 bg-green-50">
                      {f.icon}
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-900">{f.title}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ALTERNATING FEATURE DEEP-DIVES ───────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 space-y-24">

          {/* Deep dive 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, ease: E }}>
              <SectionLabel>Deploy correlation</SectionLabel>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Not just &ldquo;costs went up&rdquo; — but <em>which deploy</em>
              </h3>
              <p className="mt-4 text-gray-500 leading-relaxed">
                AWS Cost Explorer will tell you spending spiked on Tuesday. Cloudlink tells you it was
                deploy <code className="bg-gray-100 rounded px-1.5 py-0.5 text-xs font-mono text-gray-700">api@1.14.2</code> at 3:42pm on Tuesday, specifically in your ECS api-service,
                and it will cost you an estimated <strong className="text-gray-900">$4,200/month</strong> if not addressed.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Correlates cost signals to deploy timestamps", "Per-service isolation eliminates cross-service noise", "Estimated monthly impact in plain dollars", "Links directly to the deploy in your CI/CD system"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: E }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InteractiveAlert cardClass="" />
            </motion.div>
          </div>

          {/* Deep dive 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, ease: E }}
              className="order-2 md:order-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <DemoPanel cardClass="" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: E }} className="order-1 md:order-2">
              <SectionLabel>Before vs after</SectionLabel>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                See the exact moment costs diverged
              </h3>
              <p className="mt-4 text-gray-500 leading-relaxed">
                The interactive chart shows your cost signal before and after a deploy. The shift is clear.
                Cloudlink surfaces this automatically — you don&apos;t need to build dashboards or write queries.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Hourly cost signal per service", "Deploy window highlighted automatically", "Regression % and monthly dollar estimate", "Works with ECS, Lambda, RDS, ALB, and more"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── DEMO ─────────────────────────────────────────────────────────── */}
      <section id="demo" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E }} className="text-center mb-12">
            <SectionLabel>Live demo</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Watch a regression get caught
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-gray-500">
              A deploy hits production. Cloudlink detects the cost shift and estimates monthly impact automatically.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: E }}>
            <DemoPanel cardClass={card + " max-w-2xl mx-auto"} />
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── COMPARISON ───────────────────────────────────────────────────── */}
      <ComparisonTable />

      {/* ── INTEGRATIONS DEEP DIVE ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E }} className="text-center mb-12">
            <SectionLabel>Integrations</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Works with your stack, out of the box
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-gray-500">No new tools to learn. Alerts flow directly into Slack, email, or any webhook.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "AWS Cost Explorer", cat: "Data source",   desc: "We pull hourly cost data per service to build baselines and detect regressions.",         dot: "#FF9900" },
              { name: "AWS CloudTrail",    cat: "Audit log",     desc: "Every Cloudlink API call is visible in your CloudTrail. Full auditability, always.",       dot: "#FF9900" },
              { name: "AWS ECS / EKS",     cat: "Services",      desc: "Track cost regressions per ECS service or Kubernetes cluster deployment.",                  dot: "#FF9900" },
              { name: "AWS Lambda",        cat: "Serverless",    desc: "Monitor Lambda invocation cost changes tied to function deploys or traffic shifts.",        dot: "#FF9900" },
              { name: "AWS RDS",           cat: "Databases",     desc: "Detect cost increases from schema migrations, slow queries, or provisioning changes.",      dot: "#FF9900" },
              { name: "Slack",             cat: "Alerts",        desc: "Regression alerts delivered to any Slack channel, with full context and deploy link.",      dot: "#4A154B" },
              { name: "GitHub Actions",    cat: "CI/CD",         desc: "Optional webhook lets Cloudlink correlate cost data to GitHub Actions deploy events.",      dot: "#24292F" },
              { name: "PagerDuty",         cat: "Incidents",     desc: "Escalate critical cost regressions directly into your existing on-call workflow.",           dot: "#06AC38" },
              { name: "Custom Webhooks",   cat: "Any system",    desc: "Send regression alerts to any URL — JIRA, Linear, internal tools, or custom dashboards.",   dot: "#6B7280" },
            ].map((int, i) => (
              <motion.div key={int.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05, ease: E }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: int.dot }} />
                  <span className="text-sm font-semibold text-gray-900">{int.name}</span>
                  <span className="ml-auto rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">{int.cat}</span>
                </div>
                <p className="text-xs leading-relaxed text-gray-500">{int.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <Pricing />

      {/* ── SECURITY ─────────────────────────────────────────────────────── */}
      <section id="security" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E }} className="text-center mb-12">
            <SectionLabel>Security</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Security-first by design
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-gray-500">
              We built Cloudlink so you never have to compromise on access or trust.
              Your security team will approve this in a day.
            </p>
          </motion.div>

          {/* Big trust badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E }}
            className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-green-200 bg-white">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2L3 6v6c0 5.25 3.5 10.15 8 11.38C16.5 22.15 20 17.25 20 12V6l-9-4z"/>
                <path d="M7 11l3 3 5-5"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Read-only access — always</div>
              <p className="mt-0.5 text-sm text-gray-600">Cloudlink only reads from AWS Cost Explorer and CloudTrail APIs. We cannot create, modify, or delete any AWS resource. This is architectural, not just policy.</p>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {security.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06, ease: E }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-green-200 hover:shadow-md transition-all duration-200">
                <div className="text-sm font-semibold text-gray-900 mb-1.5">{s.title}</div>
                <p className="text-xs leading-relaxed text-gray-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── WAITLIST CTA ─────────────────────────────────────────────────── */}
      <section id="waitlist" className="relative overflow-hidden bg-gray-900 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-green-500/15 blur-3xl" />
          <div className="dot-grid absolute inset-0 opacity-20" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-400">
                Early access
              </span>
            </motion.div>
            <motion.h2 variants={item} className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Stop finding out about cost spikes from your AWS bill
            </motion.h2>
            <motion.p variants={item} className="mt-4 text-gray-400 text-lg">
              Join engineers already on the waitlist. Free during beta — no credit card, no agents, no infrastructure changes.
            </motion.p>
            <motion.div variants={item}>
              <WaitlistForm />
            </motion.div>
            <motion.p variants={item} className="mt-4 text-xs text-gray-600">
              Early access members get 40% off when paid plans launch — locked in forever.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
            <div>
              <LogoWordmark size={26} />
              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                Deploy-aware AWS cost regression detection for engineering teams.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Product</div>
              <ul className="space-y-2">
                {[["#how","How it works"],["#features","Features"],["#demo","Demo"],["#pricing","Pricing"]].map(([h,l]) => (
                  <li key={h}><a href={h} className="text-xs text-gray-500 hover:text-green-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Company</div>
              <ul className="space-y-2">
                {[["#","About"],["#","Blog"],["#","Changelog"],["#","Careers"]].map(([h,l]) => (
                  <li key={l}><a href={h} className="text-xs text-gray-500 hover:text-green-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Legal</div>
              <ul className="space-y-2">
                {[["#","Privacy Policy"],["#","Terms of Service"],["#","Security"],["#","Cookie Policy"]].map(([h,l]) => (
                  <li key={l}><a href={h} className="text-xs text-gray-500 hover:text-green-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-400">© {new Date().getFullYear()} Cloudlink Global Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                All systems operational
              </span>
              <a href="/login" className="hover:text-green-600 transition-colors">Sign in</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
