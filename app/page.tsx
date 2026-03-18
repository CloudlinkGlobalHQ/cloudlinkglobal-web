"use client";

import { useState } from "react";
import WaitlistForm from "./components/WaitlistForm";
import MouseGlow from "./components/MouseGlow";
import Reveal from "./components/Reveal";
import { Stagger, StaggerItem } from "./components/Stagger";
import InteractiveAlert from "./components/InteractiveAlert";
import MagneticButton from "./components/MagneticButton";
import StickyNav from "./components/StickyNav";
import DemoPanel from "./components/DemoPanel";
import CinematicIntro from "./components/CinematicIntro";
import { LogoWordmark } from "./components/Logo";
import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Reusable class strings ──────────────────────────────────────────────── */
const card =
  "rounded-2xl border border-white/8 bg-white/[0.035] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.05]";
const cardSm =
  "rounded-xl border border-white/8 bg-white/[0.035] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.05]";
const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50";
const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/0 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/30 hover:bg-white/5 transition-all duration-200";

const hoverCard = {
  whileHover: { y: -4, scale: 1.005 },
  transition: { type: "spring", stiffness: 420, damping: 30 },
} as const;

/* ─── Data ────────────────────────────────────────────────────────────────── */
const steps = [
  {
    step: "01",
    title: "Connect AWS safely",
    desc: "Create a scoped, read-only IAM role in 2 minutes. No agents, no credentials shared.",
    badge: "IAM Role",
  },
  {
    step: "02",
    title: "We build your baseline",
    desc: "Cloudlink learns normal cost patterns per service and watches for changes after every deploy.",
    badge: "Automatic",
  },
  {
    step: "03",
    title: "Get instant alerts",
    desc: "See the exact % change and estimated monthly impact, linked directly to the deploy window.",
    badge: "Real-time",
  },
];

const features = [
  {
    icon: "⚡",
    title: "Deploy-linked detection",
    desc: "Every cost spike is traced back to the exact deploy that caused it — not just a noisy anomaly.",
  },
  {
    icon: "🛡️",
    title: "Read-only by design",
    desc: "No write access. No infrastructure changes possible. All access is visible in CloudTrail.",
  },
  {
    icon: "📊",
    title: "Monthly impact estimates",
    desc: "Instantly see the annualized cost projection so you can prioritize what to fix first.",
  },
  {
    icon: "🔔",
    title: "Actionable alerts",
    desc: "Slack, email, or webhook. Get notified the moment a regression is detected — not days later.",
  },
];

const trust = [
  {
    title: "Read-only permissions",
    desc: "No write access. No infrastructure changes possible from Cloudlink.",
    color: "from-indigo-500/20 to-indigo-500/5",
  },
  {
    title: "No logs or PII",
    desc: "We never access application logs or customer data. Only cost signals.",
    color: "from-violet-500/20 to-violet-500/5",
  },
  {
    title: "Auditable access",
    desc: "Every API call is visible in your AWS CloudTrail. Nothing hidden.",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "Revocable anytime",
    desc: "Delete the IAM role to immediately and permanently cut off access.",
    color: "from-indigo-500/20 to-indigo-500/5",
  },
];

const services = ["AWS", "ECS", "EKS", "Lambda", "RDS", "ALB", "CloudTrail", "Cost Explorer"];

/* ─── Floating metric card ────────────────────────────────────────────────── */
function MetricCard({
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
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: E }}
      className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3 min-w-[140px]"
    >
      <div className={`text-xs font-semibold ${accent}`}>{label}</div>
      <div className="mt-1 text-xl font-bold text-white tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-white/50">{sub}</div>
    </motion.div>
  );
}

/* ─── Section label ───────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-300">
      {children}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <main className="min-h-screen bg-[#040410] text-white overflow-x-hidden">
      <CinematicIntro onComplete={() => setIntroComplete(true)} />
      <MouseGlow />

      {/* Sticky nav — fades in after intro */}
      <motion.div
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: E }}
      >
        <StickyNav
          items={[
            { id: "top", label: "Home" },
            { id: "how", label: "How" },
            { id: "demo", label: "Demo" },
            { id: "security", label: "Security" },
            { id: "waitlist", label: "Early Access" },
          ]}
        />
      </motion.div>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section id="top" className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 w-[500px] h-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
          {/* Dot grid */}
          <div className="dot-grid absolute inset-0 opacity-60" />
        </div>

        <Reveal>
          {/* Announcement badge */}
          <div className="mb-8 flex justify-center">
            <a
              href="#waitlist"
              className="group inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-500/15 transition-all duration-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_2px_rgba(99,102,241,0.7)]" />
              Now accepting early access applications
              <span className="text-indigo-400 transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-white">
            Know instantly when a deploy
            <br />
            <span className="text-gradient">costs you money</span>
          </h1>

          <p className="mt-6 mx-auto max-w-xl text-lg leading-relaxed text-white/55">
            Cloudlink ties AWS cost changes directly to deployments so
            engineering teams catch expensive regressions early — before the
            bill compounds.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton href="#waitlist" className={primaryBtn}>
              Get early access
            </MagneticButton>
            <a href="#how" className={secondaryBtn}>
              See how it works →
            </a>
          </div>

          {/* Trust tags */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-white/45">
            {["Read-only AWS access", "No agents or credentials", "Monthly impact estimates"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1"
                >
                  {t}
                </span>
              )
            )}
          </div>
        </Reveal>

        {/* Floating metric cards */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <MetricCard
            label="Cost spike detected"
            value="+18%"
            sub="api-service · api@1.14.2"
            accent="text-red-300"
            delay={0.8}
          />
          <MetricCard
            label="Monthly impact"
            value="$4,200"
            sub="Estimated regression"
            accent="text-amber-300"
            delay={0.95}
          />
          <MetricCard
            label="Deploy flagged"
            value="#247"
            sub="2h after production"
            accent="text-indigo-300"
            delay={1.1}
          />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        {/* ─── AWS Trust Strip ──────────────────────────────────────────────── */}
        <Reveal>
          <div className="py-10 border-y border-white/6">
            <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-5">
              Built for teams running on
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {services.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/60"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how" className="mt-20">
          <Stagger>
            <StaggerItem>
              <div className="mb-10 text-center">
                <SectionLabel>How it works</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  Three steps to deploy-aware cost tracking
                </h2>
                <p className="mt-3 mx-auto max-w-xl text-white/55">
                  Connect read-only access, we learn your cost patterns, and alert you the moment a
                  deploy causes a regression.
                </p>
              </div>
            </StaggerItem>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((x, i) => (
                <StaggerItem key={x.step}>
                  <motion.div className={card} {...hoverCard}>
                    <div className="flex items-start justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300">
                        {x.step}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
                        {x.badge}
                      </span>
                    </div>
                    <div className="mt-4 text-base font-semibold">{x.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{x.desc}</p>
                    {i < steps.length - 1 && (
                      <div className="mt-5 hidden md:block absolute right-0 top-1/2 text-white/20 text-lg">
                        →
                      </div>
                    )}
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </section>

        {/* ─── FEATURES BENTO GRID ──────────────────────────────────────────── */}
        <section id="features" className="mt-20">
          <Stagger>
            <StaggerItem>
              <div className="mb-10 text-center">
                <SectionLabel>Features</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  Designed for engineering teams
                </h2>
                <p className="mt-3 mx-auto max-w-xl text-white/55">
                  Cost dashboards tell you what changed. Cloudlink tells you what caused it.
                </p>
              </div>
            </StaggerItem>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((f) => (
                <StaggerItem key={f.title}>
                  <motion.div className={card} {...hoverCard}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-xl">
                      {f.icon}
                    </div>
                    <div className="mt-4 text-base font-semibold">{f.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </section>

        {/* ─── DEMO PANEL ───────────────────────────────────────────────────── */}
        <section id="demo" className="mt-20">
          <Stagger>
            <StaggerItem>
              <div className="mb-10 text-center">
                <SectionLabel>Live demo</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  See it detect a cost regression
                </h2>
                <p className="mt-3 mx-auto max-w-xl text-white/55">
                  A deploy hits production. Cloudlink detects the cost shift and estimates monthly
                  impact — all automatically.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <DemoPanel cardClass={card} />
            </StaggerItem>
          </Stagger>
        </section>

        {/* ─── WHAT YOU GET ─────────────────────────────────────────────────── */}
        <section id="get" className="mt-20">
          <Stagger>
            <StaggerItem>
              <div className="mb-10 text-center">
                <SectionLabel>Output</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  A regression summary, instantly
                </h2>
                <p className="mt-3 mx-auto max-w-xl text-white/55">
                  When a deploy changes cost behavior, Cloudlink surfaces a clear alert with context
                  you can act on.
                </p>
              </div>
            </StaggerItem>

            <div className="grid gap-4 md:grid-cols-2">
              <StaggerItem>
                <InteractiveAlert cardClass={card} />
              </StaggerItem>

              <StaggerItem>
                <motion.div className={card} {...hoverCard}>
                  <SectionLabel>Why it&apos;s different</SectionLabel>
                  <h3 className="mt-4 text-lg font-semibold">
                    Not just another cost dashboard
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    AWS Cost Explorer shows you what changed. Cloudlink tells you{" "}
                    <span className="text-white font-medium">exactly which deploy caused it</span>{" "}
                    — so you can roll back or fix the regression before the bill compounds.
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      "Regressions linked to the exact deploy window",
                      "Estimated monthly impact in dollars",
                      "Service-level baselines, not account-wide noise",
                      "Read-only — zero risk to your infrastructure",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-white/65">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <a href="#waitlist" className={primaryBtn}>
                      Get early access
                    </a>
                  </div>
                </motion.div>
              </StaggerItem>
            </div>
          </Stagger>
        </section>

        {/* ─── SECURITY ─────────────────────────────────────────────────────── */}
        <section id="security" className="mt-20">
          <Stagger>
            <StaggerItem>
              <div className="mb-10 text-center">
                <SectionLabel>Security</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  Security-first by design
                </h2>
                <p className="mt-3 mx-auto max-w-xl text-white/55">
                  We built Cloudlink so you never have to compromise on access or trust.
                </p>
              </div>
            </StaggerItem>

            <div className="grid gap-4 md:grid-cols-2">
              {trust.map((x) => (
                <StaggerItem key={x.title}>
                  <motion.div
                    className={`${cardSm} relative overflow-hidden`}
                    {...hoverCard}
                  >
                    {/* Gradient bleed */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${x.color} opacity-60 rounded-xl`}
                    />
                    <div className="relative">
                      <div className="font-semibold text-white">{x.title}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55">{x.desc}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </section>

        {/* ─── WAITLIST CTA ─────────────────────────────────────────────────── */}
        <Reveal>
          <section
            id="waitlist"
            className="relative mt-20 overflow-hidden rounded-2xl p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.25) 50%, rgba(255,255,255,0.06) 100%)",
            }}
          >
            <div className="relative rounded-2xl bg-[#07071a] px-8 py-12 md:px-12">
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/15 blur-[100px]" />
              </div>

              <div className="relative text-center">
                <SectionLabel>Early access</SectionLabel>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                  Join the waitlist
                </h2>
                <p className="mt-3 mx-auto max-w-md text-white/55">
                  Get notified when Cloudlink opens onboarding. Early customers get hands-on
                  setup support and priority access.
                </p>
              </div>

              <div className="relative mt-8 mx-auto max-w-lg">
                <WaitlistForm />
              </div>
            </div>
          </section>
        </Reveal>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <Reveal>
          <footer className="mt-16 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/6 pt-8">
            <LogoWordmark size={28} />

            <nav className="flex items-center gap-5 text-xs text-white/45">
              {["#how", "#demo", "#security", "#waitlist"].map((href) => {
                const label = href.slice(1);
                return (
                  <a
                    key={href}
                    href={href}
                    className="capitalize hover:text-white/70 transition-colors"
                  >
                    {label}
                  </a>
                );
              })}
              <a href="/login" className="hover:text-white/70 transition-colors">
                Sign in
              </a>
            </nav>

            <div className="text-xs text-white/30">
              © {new Date().getFullYear()} Cloudlink Global. All rights reserved.
            </div>
          </footer>
        </Reveal>
      </div>
    </main>
  );
}
