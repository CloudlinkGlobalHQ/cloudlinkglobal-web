"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import WaitlistForm from "./components/WaitlistForm";
import MouseGlow from "./components/MouseGlow";
import StickyNav from "./components/StickyNav";
import InteractiveAlert from "./components/InteractiveAlert";
import MagneticButton from "./components/MagneticButton";
import DemoPanel from "./components/DemoPanel";
import { LogoWordmark } from "./components/Logo";
import AnimatedGradientText from "./components/AnimatedGradientText";
import TiltCard from "./components/TiltCard";
import AnimatedCounter from "./components/AnimatedCounter";
import GlowOrb from "./components/GlowOrb";
import HeroDashboard from "./components/HeroDashboard";
import Testimonials from "./components/Testimonials";
import ComparisonTable from "./components/ComparisonTable";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";

// Lazy load heavy WebGL component
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Animation variants for staggered sections
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: E },
  },
};

// Classes
const card =
  "rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/18 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(99,102,241,0.08)]";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400/50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/0 px-7 py-3 text-sm font-semibold text-white/75 hover:border-white/35 hover:bg-white/6 transition-all duration-200 active:scale-95";

const steps = [
  {
    step: "01",
    title: "Connect AWS safely",
    desc: "Create a scoped, read-only IAM role in under 2 minutes. No agents, no credentials shared.",
    icon: "🔑",
  },
  {
    step: "02",
    title: "We learn your baseline",
    desc: "Cloudlink builds a cost baseline per service and watches for changes after every deploy.",
    icon: "📈",
  },
  {
    step: "03",
    title: "Get instant alerts",
    desc: "See exact % change and estimated monthly impact, linked directly to the deploy window.",
    icon: "⚡",
  },
];

const features = [
  {
    icon: "⚡",
    title: "Deploy-linked detection",
    desc: "Every cost spike is traced back to the exact deploy that caused it — not just noise.",
    glow: "indigo",
  },
  {
    icon: "🛡️",
    title: "Read-only by design",
    desc: "No write access. No infrastructure changes possible. All access is visible in CloudTrail.",
    glow: "violet",
  },
  {
    icon: "📊",
    title: "Monthly impact estimates",
    desc: "See the annualized cost projection so you can prioritize what to fix first.",
    glow: "purple",
  },
  {
    icon: "🔔",
    title: "Actionable alerts",
    desc: "Slack, email, or webhook. Notified the moment a regression is detected — not days later.",
    glow: "indigo",
  },
];

const trust = [
  {
    title: "Read-only permissions",
    desc: "No write access. No infrastructure changes possible from Cloudlink.",
    color: "from-indigo-500/15 to-transparent",
  },
  {
    title: "No logs or PII",
    desc: "We never access application logs or customer data. Only cost signals.",
    color: "from-violet-500/15 to-transparent",
  },
  {
    title: "Auditable access",
    desc: "Every API call is visible in your AWS CloudTrail. Nothing hidden.",
    color: "from-purple-500/15 to-transparent",
  },
  {
    title: "Revocable anytime",
    desc: "Delete the IAM role to immediately cut off access permanently.",
    color: "from-indigo-500/15 to-transparent",
  },
];

const stats = [
  { value: 47, suffix: " teams", label: "on waitlist", prefix: "" },
  { value: 2300000, suffix: "", label: "cost regressions tracked", prefix: "$" },
  { value: 2, suffix: "h avg", label: "detection time", prefix: "<" },
  { value: 99, suffix: "%", label: "read-only safe", prefix: "" },
];

const services = ["AWS", "ECS", "EKS", "Lambda", "RDS", "ALB", "CloudTrail", "Cost Explorer"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-300">
      {children}
    </div>
  );
}

// Floating card that bobs up and down
function FloatCard({
  delay = 0,
  children,
  className = "",
}: {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Metric card for hero
function HeroMetric({
  label,
  value,
  sub,
  accent,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: E }}
    >
      <FloatCard delay={delay}>
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-xl px-5 py-4 min-w-[150px] shadow-xl shadow-black/30">
          <div className={`text-[11px] font-semibold uppercase tracking-wider ${accent}`}>
            {label}
          </div>
          <div className="mt-1.5 text-2xl font-bold text-white tracking-tight">{value}</div>
          <div className="mt-0.5 text-xs text-white/45">{sub}</div>
        </div>
      </FloatCard>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 80]);

  return (
    <main className="min-h-screen bg-[#040410] text-white overflow-x-hidden">
      <MouseGlow />

      {/* Sticky nav */}
      <div>
        <StickyNav
          items={[
            { id: "top", label: "Home" },
            { id: "how", label: "How" },
            { id: "demo", label: "Demo" },
            { id: "security", label: "Security" },
            { id: "waitlist", label: "Early Access" },
          ]}
        />
      </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        id="top"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-16 text-center"
      >
        {/* WebGL particles */}
        <ParticleField />

        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <GlowOrb color="indigo" size={900} x="50%" y="30%" opacity={0.18} blur={140} />
          <GlowOrb
            color="violet"
            size={600}
            x="20%"
            y="60%"
            opacity={0.12}
            blur={120}
            animate={false}
          />
          <GlowOrb
            color="purple"
            size={500}
            x="80%"
            y="50%"
            opacity={0.1}
            blur={100}
            animate={false}
          />
        </div>

        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />

        {/* Content with parallax */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 w-full max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: E }}
            className="mb-8 flex justify-center"
          >
            <a
              href="#waitlist"
              className="group inline-flex items-center gap-2.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-2 text-xs font-medium text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/18 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
              </span>
              Now accepting early access applications
              <span className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5 text-indigo-400">
                →
              </span>
            </a>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: E }}
            className="text-5xl font-bold tracking-tight leading-[1.04] md:text-7xl"
          >
            Know instantly when a<br />deploy{" "}
            <AnimatedGradientText>costs you money</AnimatedGradientText>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: E }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/55"
          >
            Cloudlink ties AWS cost changes directly to deployments so engineering teams catch
            expensive regressions early — before the bill compounds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: E }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <MagneticButton href="#waitlist" className={primaryBtn}>
              <span>Get early access</span>
              <span>→</span>
            </MagneticButton>
            <a href="#how" className={secondaryBtn}>
              <span>See how it works</span>
              <span className="text-white/40">↓</span>
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
          >
            {["Read-only AWS access", "No agents or credentials", "Deploy-linked detection"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-4 py-1.5 text-xs text-white/45"
                >
                  {t}
                </span>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Hero dashboard mockup */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4">
          <HeroDashboard />
        </div>

        {/* Floating metric cards — hidden on mobile, shown on md+ */}
        <div className="relative z-10 mt-6 hidden md:flex flex-wrap items-center justify-center gap-4">
          <HeroMetric
            label="Cost spike"
            value="+18%"
            sub="api-service · deploy #247"
            accent="text-red-400"
            delay={1.4}
          />
          <HeroMetric
            label="Monthly impact"
            value="$4,200"
            sub="Estimated regression"
            accent="text-amber-400"
            delay={1.55}
          />
          <HeroMetric
            label="Detected in"
            value="< 2h"
            sub="After production deploy"
            accent="text-emerald-400"
            delay={1.7}
          />
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 2, duration: 0.5 },
            y: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase flex flex-col items-center gap-2"
        >
          <span>scroll</span>
          <span>↓</span>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative border-y border-white/6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5" />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: E }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white tracking-tight">
                  <AnimatedCounter
                    end={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                  />
                </div>
                <div className="mt-1 text-xs text-white/45">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── AWS TRUST STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: E }}
          className="py-12 text-center"
        >
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Built for teams running on
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {services.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: E }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/55 hover:border-indigo-500/40 hover:text-indigo-300 transition-all duration-200 cursor-default"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="mt-8 mb-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={item} className="mb-12 text-center">
              <SectionLabel>How it works</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Three steps to deploy-aware cost tracking
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-white/50">
                Connect read-only access, we learn your cost patterns, and alert you the moment a
                deploy causes a regression.
              </p>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((x) => (
                <motion.div key={x.step} variants={item}>
                  <TiltCard className={card + " h-full"}>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-xl">
                        {x.icon}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono font-semibold text-white/40">
                        {x.step}
                      </span>
                    </div>
                    <div className="mt-5 text-base font-semibold">{x.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{x.desc}</p>
                    {/* Animated progress line */}
                    <div className="mt-5 h-px bg-white/6">
                      <motion.div
                        className="h-px bg-gradient-to-r from-indigo-500 to-violet-500"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3, ease: E }}
                      />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="mb-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={item} className="mb-12 text-center">
              <SectionLabel>Features</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Designed for engineering teams
              </h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((f) => (
                <motion.div key={f.title} variants={item}>
                  <TiltCard className={card + " h-full"}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl">
                      {f.icon}
                    </div>
                    <div className="mt-4 text-base font-semibold">{f.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{f.desc}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── DEMO ── */}
        <section id="demo" className="mb-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={item} className="mb-10 text-center">
              <SectionLabel>Live demo</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Watch a regression get caught
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-white/50">
                A deploy hits production. Cloudlink detects the cost shift and estimates monthly
                impact — automatically.
              </p>
            </motion.div>
            <motion.div variants={item}>
              <DemoPanel cardClass={card} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section id="get" className="mb-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={item} className="mb-10 text-center">
              <SectionLabel>Output</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                A regression summary, instantly
              </h2>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-2">
              <motion.div variants={item}>
                <InteractiveAlert cardClass={card} />
              </motion.div>
              <motion.div variants={item}>
                <TiltCard className={card + " h-full"}>
                  <SectionLabel>Why it&apos;s different</SectionLabel>
                  <h3 className="mt-4 text-lg font-semibold">Not just another cost dashboard</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    AWS Cost Explorer shows you what changed. Cloudlink tells you{" "}
                    <span className="text-white font-medium">exactly which deploy caused it</span>{" "}
                    — so you can fix it before the bill compounds.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Regressions linked to the exact deploy window",
                      "Estimated monthly impact in dollars",
                      "Service-level baselines, not account-wide noise",
                      "Read-only — zero risk to your infrastructure",
                    ].map((t, i) => (
                      <motion.li
                        key={t}
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: E }}
                        className="flex items-start gap-3 text-sm text-white/60"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">
                          ✓
                        </span>
                        {t}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <a href="#waitlist" className={primaryBtn}>
                      Get early access →
                    </a>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <Testimonials />

        {/* ── COMPARISON TABLE ── */}
        <ComparisonTable />

        {/* ── PRICING ── */}
        <Pricing />

        {/* ── SECURITY ── */}
        <section id="security" className="mb-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={item} className="mb-10 text-center">
              <SectionLabel>Security</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Security-first by design
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-white/50">
                We built Cloudlink so you never have to compromise on access or trust.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {trust.map((x) => (
                <motion.div key={x.title} variants={item}>
                  <TiltCard className={`${card} relative overflow-hidden`}>
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${x.color} rounded-2xl`}
                    />
                    <div className="relative">
                      <div className="font-semibold text-white">{x.title}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/50">{x.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
        {/* ── FAQ ── */}
        <FAQ />
      </div>

      {/* ── WAITLIST CTA ── */}
      <section id="waitlist" className="relative overflow-hidden border-t border-white/6 py-24">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <GlowOrb color="indigo" size={800} x="50%" y="50%" opacity={0.15} blur={160} />
          <GlowOrb
            color="violet"
            size={500}
            x="80%"
            y="30%"
            opacity={0.08}
            blur={100}
            animate={false}
          />
          <div className="dot-grid absolute inset-0 opacity-30" />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <SectionLabel>Early access</SectionLabel>
            </motion.div>
            <motion.h2
              variants={item}
              className="mt-4 text-4xl font-bold tracking-tight md:text-5xl"
            >
              Join the waitlist
            </motion.h2>
            <motion.p variants={item} className="mt-4 text-white/50 text-lg">
              Get notified when Cloudlink opens. Early customers get hands-on setup support and
              priority access.
            </motion.p>
            <motion.div variants={item} className="mt-10">
              <WaitlistForm />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/6 py-10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <LogoWordmark size={28} />
          <nav className="flex items-center gap-5 text-xs text-white/35">
            {(
              [
                ["#how", "How"],
                ["#demo", "Demo"],
                ["#security", "Security"],
                ["#waitlist", "Early Access"],
                ["/login", "Sign in"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hover:text-white/65 transition-colors capitalize"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="text-xs text-white/25">
            © {new Date().getFullYear()} Cloudlink Global
          </div>
        </div>
      </footer>
    </main>
  );
}
