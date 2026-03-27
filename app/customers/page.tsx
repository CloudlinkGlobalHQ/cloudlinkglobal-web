"use client";

import { motion } from "framer-motion";
import { ArrowRight, Quote, TrendingDown, Clock, DollarSign, Users } from "lucide-react";
import Link from "next/link";


// ── animation ─────────────────────────────────────────────────────────────────
const E: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

// ── hero stats ────────────────────────────────────────────────────────────────
const stats = [
  { icon: <DollarSign size={18} className="text-[#10B981]" />, value: "$2.3M", label: "tracked savings" },
  { icon: <Users size={18} className="text-[#10B981]" />, value: "47", label: "engineering teams" },
  { icon: <Clock size={18} className="text-[#059669]" />, value: "<2hr", label: "avg detection time" },
  { icon: <TrendingDown size={18} className="text-[#10B981]" />, value: "23%", label: "avg cloud savings" },
];

// ── case studies ──────────────────────────────────────────────────────────────
const caseStudies = [
  {
    company: "PayFlow",
    industry: "Fintech",
    color: "#10B981",
    gradient: "from-[#10B981]/20 to-[#059669]/10",
    border: "border-[#10B981]/30",
    challenge: "Lambda costs spiking unpredictably after every deploy — no visibility into which deploy caused what.",
    solution: "Deploy-linked regression detection connected to their GitHub Actions pipeline. Every deploy got a cost fingerprint within minutes.",
    result: "Caught the culprit in 45 minutes. Reduced EC2 waste by 67%.",
    metrics: [
      { label: "Monthly savings", value: "$18K" },
      { label: "EC2 waste reduced", value: "67%" },
      { label: "Time to detect", value: "45 min" },
    ],
    quote: "We had 3 engineers spending 2 days/month digging through Cost Explorer. Now it's automated.",
    author: "CTO, PayFlow",
    avatar: "AT",
    avatarColor: "#10B981",
  },
  {
    company: "BuildKit",
    industry: "SaaS Scaleup",
    color: "#059669",
    gradient: "from-[#059669]/20 to-[#10B981]/10",
    border: "border-[#059669]/30",
    challenge: "Midnight deploys causing cost regressions that engineers only discovered weeks later — long after the damage was done.",
    solution: "Cloudlink integrated with their deployment pipeline and caught a regression within 90 minutes, automatically surfacing the root cause and suggesting a fix.",
    result: "Saved $34K in one month. Zero manual cost reviews since integration.",
    metrics: [
      { label: "Saved in one month", value: "$34K" },
      { label: "Manual cost reviews", value: "0" },
      { label: "Time to detect", value: "90 min" },
    ],
    quote: "The first regression it caught paid for the next 2 years of the service — except it's free until it saves you money anyway.",
    author: "VP Engineering, BuildKit",
    avatar: "MK",
    avatarColor: "#059669",
  },
  {
    company: "Shoprise",
    industry: "E-commerce",
    color: "#10B981",
    gradient: "from-[#10B981]/20 to-[#10B981]/10",
    border: "border-[#10B981]/30",
    challenge: "Dev and staging environments running 24/7. $12K/month burned overnight and on weekends with no one even using them.",
    solution: "AutoStopping detected inactivity patterns across 24 dev environments and implemented schedule-based shutdowns with instant restart on incoming traffic.",
    result: "$8K/month saved immediately. 65% reduction in dev environment costs with zero developer friction.",
    metrics: [
      { label: "Monthly savings", value: "$8K" },
      { label: "Dev env costs cut", value: "65%" },
      { label: "Setup time", value: "20 min" },
    ],
    quote: "Took 20 minutes to set up. Saved us $8,000 the first month.",
    author: "Platform Lead, Shoprise",
    avatar: "SL",
    avatarColor: "#10B981",
  },
];

// ── testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "The ROI is insane. We were wasting $40K/year on idle EBS volumes alone.",
    author: "Dana K.",
    role: "Senior DevOps Engineer",
    company: "Series B fintech",
    avatar: "DK",
    color: "#10B981",
  },
  {
    quote: "Finally something that doesn't just tell you you're wasting money — it actually fixes it.",
    author: "Rohan M.",
    role: "VP Engineering",
    company: "SaaS platform",
    avatar: "RM",
    color: "#059669",
  },
  {
    quote: "AutoStopping alone saves us more than our entire engineering tooling budget combined.",
    author: "Priya S.",
    role: "Platform Engineer",
    company: "E-commerce scale-up",
    avatar: "PS",
    color: "#10B981",
  },
  {
    quote: "The deploy attribution feature is something I've wanted for 3 years. I can't believe it didn't exist before.",
    author: "James T.",
    role: "Staff Engineer",
    company: "Developer tools startup",
    avatar: "JT",
    color: "#10B981",
  },
  {
    quote: "We approved the first batch of fixes in a Slack thread during standup. That was it.",
    author: "Mei L.",
    role: "Engineering Manager",
    company: "Healthcare SaaS",
    avatar: "ML",
    color: "#059669",
  },
  {
    quote: "No other tool in our stack pays for itself. Cloudlink is the exception — and it literally doesn't charge unless it does.",
    author: "Anita R.",
    role: "Head of Platform",
    company: "Growth-stage marketplace",
    avatar: "AR",
    color: "#10B981",
  },
];

export default function CustomersPage() {
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
              Customers
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Engineering teams saving{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#10B981] bg-clip-text text-transparent">
              real money
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-12 max-w-xl mx-auto">
            Real results from real engineering teams. No vendor fluff.
          </motion.p>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-[#141C33] border border-[#1E2D4F] rounded-2xl px-4 py-5 flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0F1629] flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="text-2xl font-black text-[#F1F5F9]">{s.value}</div>
                <div className="text-xs text-[#94A3B8] text-center">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                Case studies
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">The results speak for themselves</h2>
            </motion.div>

            <div className="space-y-8">
              {caseStudies.map((cs, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`bg-[#141C33] border ${cs.border} rounded-3xl overflow-hidden`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${cs.gradient} px-8 py-6 border-b border-[#1E2D4F]`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: cs.color }}
                          >
                            {cs.company[0]}
                          </div>
                          <h3 className="text-xl font-bold text-[#F1F5F9]">{cs.company}</h3>
                          <span className="text-xs border border-[#1E2D4F] bg-[#0A0E1A]/60 text-[#94A3B8] px-2.5 py-0.5 rounded-full">
                            {cs.industry}
                          </span>
                        </div>
                      </div>
                      {/* Key metric highlight */}
                      <div className="text-right">
                        <div className="text-2xl font-black" style={{ color: cs.color }}>
                          {cs.metrics[0].value}
                        </div>
                        <div className="text-xs text-[#94A3B8]">{cs.metrics[0].label}</div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      {/* Challenge / Solution / Result */}
                      {[
                        { label: "Challenge", text: cs.challenge, color: "text-red-400" },
                        { label: "Solution", text: cs.solution, color: "text-[#10B981]" },
                        { label: "Result", text: cs.result, color: "text-[#10B981]" },
                      ].map((block) => (
                        <div key={block.label}>
                          <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${block.color}`}>
                            {block.label}
                          </div>
                          <p className="text-[#94A3B8] text-sm leading-relaxed">{block.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {cs.metrics.map((m, j) => (
                        <div key={j} className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-4 text-center">
                          <div className="text-xl font-black mb-1" style={{ color: cs.color }}>{m.value}</div>
                          <div className="text-xs text-[#94A3B8]">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Quote */}
                    <div className="border-t border-[#1E2D4F] pt-6">
                      <div className="flex items-start gap-4">
                        <Quote size={20} className="flex-shrink-0 mt-0.5" style={{ color: cs.color }} />
                        <div>
                          <p className="text-[#F1F5F9] italic leading-relaxed mb-3">"{cs.quote}"</p>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: cs.avatarColor }}
                            >
                              {cs.avatar}
                            </div>
                            <span className="text-sm text-[#94A3B8]">{cs.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS GRID ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">What engineers are saying</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-[#141C33] border border-[#1E2D4F] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#10B981]/30 transition-colors duration-200"
                >
                  <Quote size={18} style={{ color: t.color }} className="flex-shrink-0" />
                  <p className="text-[#F1F5F9] text-sm leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 border-t border-[#1E2D4F] pt-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-[#F1F5F9] text-sm font-semibold">{t.author}</div>
                      <div className="text-xs text-[#94A3B8]">{t.role} · {t.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
              Join 47 engineering teams saving money
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#94A3B8] text-lg mb-8">
              Connect in 5 minutes. Pay nothing until we prove savings.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#3d5ce6] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
                Start saving today <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
