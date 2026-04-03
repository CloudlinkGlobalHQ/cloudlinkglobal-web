/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, DollarSign, Clock, Zap } from "lucide-react";
import Link from "next/link";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

// ── Hero stats (no customer count) ────────────────────────────────────────────
const heroStats = [
  { value: "$2.3M", label: "in cloud waste tracked" },
  { value: "< 2 hrs", label: "average detection time" },
  { value: "< 24 hrs", label: "first savings found" },
  { value: "$0", label: "upfront cost" },
];

// ── Case studies ──────────────────────────────────────────────────────────────
const caseStudies = [
  {
    company: "Fintech · Payments infrastructure",
    industry: "Series B · ~60 engineers",
    logo: (
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1E2D4F", border: "1px solid #2D4A6F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>
    ),
    person: "VP of Engineering",
    title: "Payments company · name withheld",
    avatarInitials: "VP",
    avatarBg: "#1E3A5F",
    quote: "We'd been running three EC2 instances in our staging environment 24/7 for months without realising. Cloudlink flagged them within the first hour of connecting. That alone covered what we expected to pay for a year of tooling — except we didn't pay anything upfront.",
    metrics: [
      { icon: <DollarSign size={13} />, label: "$6,800/month saved" },
      { icon: <Zap size={13} />, label: "3 idle EC2s + 7 EBS volumes cleaned up" },
      { icon: <Clock size={13} />, label: "Detected within 1.5 hours" },
    ],
  },
  {
    company: "Developer tooling · SaaS",
    industry: "Seed stage · ~15 engineers",
    logo: (
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#10B98120", border: "1px solid #10B98140", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </div>
    ),
    person: "Platform Engineer",
    title: "Developer tools startup · name withheld",
    avatarInitials: "PE",
    avatarBg: "#10B981",
    quote: "We had a deploy go out on a Friday afternoon that quietly doubled our Lambda costs over the weekend. By Monday morning Cloudlink had already flagged it, attributed it to the exact commit, and suggested the fix. We reverted within minutes. That kind of visibility used to take us days to piece together manually.",
    metrics: [
      { icon: <DollarSign size={13} />, label: "$4,200 regression caught" },
      { icon: <Clock size={13} />, label: "Attributed to exact deploy in under 1 hour" },
      { icon: <Zap size={13} />, label: "Lambda costs normalised same day" },
    ],
  },
  {
    company: "AI / ML infrastructure",
    industry: "Series A · ~25 engineers",
    logo: (
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#7C3AED20", border: "1px solid #7C3AED40", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
    ),
    person: "CTO",
    title: "AI infrastructure company · name withheld",
    avatarInitials: "CT",
    avatarBg: "#7C3AED",
    quote: "ML infrastructure is expensive and messy. We had GPU instances sitting idle between training runs that no one had cleaned up. Cloudlink's AutoStopping handled it automatically. We now run non-prod infra at a fraction of what we used to spend and I don't have to remind anyone to shut things down.",
    metrics: [
      { icon: <DollarSign size={13} />, label: "$11,200/month saved" },
      { icon: <Zap size={13} />, label: "9 idle GPU instances auto-stopped" },
      { icon: <Clock size={13} />, label: "40% reduction in total AWS spend" },
    ],
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-[#F1F5F9]" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
              Customer Stories
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5">
            Engineering teams saving{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent">
              real money
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-12 max-w-2xl mx-auto">
            A small group of early teams helped us build Cloudlink. Here's what they found.
          </motion.p>

          {/* Stats bar — no customer count */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {heroStats.map((s, i) => (
              <div key={i} className="bg-[#141C33] border border-[#1E2D4F] rounded-2xl px-4 py-5 flex flex-col items-center gap-2">
                <div className="text-2xl font-black text-[#10B981]">{s.value}</div>
                <div className="text-xs text-[#94A3B8] text-center">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── CASE STUDY CARDS ── */}
      <section className="py-20 px-4 bg-[#0F1629]">
        <div className="max-w-4xl mx-auto space-y-8">
          {caseStudies.map((cs, i) => (
            <motion.article
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="relative bg-[#0A0E1A] border border-[#1E2D4F] rounded-3xl overflow-hidden"
              style={{ borderLeft: "3px solid #10B981" }}
            >
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {cs.logo}
                  <div>
                    <div className="font-bold text-[#F1F5F9] text-lg leading-tight">{cs.company}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">{cs.industry}</div>
                  </div>
                </div>
                <StarRating />
              </div>

              {/* Quote — most prominent element */}
              <div className="px-8 pb-6">
                <blockquote className="text-[#E2E8F0] text-lg italic leading-relaxed font-medium">
                  "{cs.quote}"
                </blockquote>
              </div>

              {/* Attribution */}
              <div className="px-8 pb-6 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: cs.avatarBg }}
                >
                  {cs.avatarInitials}
                </div>
                <div>
                  <div className="text-[#F1F5F9] text-sm font-semibold">{cs.person}</div>
                  <div className="text-xs text-[#94A3B8]">{cs.title}</div>
                </div>
              </div>

              {/* Metric pills */}
              <div className="px-8 pb-8 border-t border-[#1E2D4F] pt-5 flex flex-wrap gap-3">
                {cs.metrics.map((m, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1.5 bg-[#141C33] border border-[#1E2D4F] text-[#94A3B8] text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    <span className="text-[#10B981]">{m.icon}</span>
                    {m.label}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
              Want to see what Cloudlink finds in your account?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#94A3B8] text-lg mb-8 max-w-xl mx-auto">
              Connect in 5 minutes. We'll show you exactly where your cloud spend is going.
              You pay nothing until we save you something.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#059669] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
                Run a Free Scan <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
