"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronDown, ArrowRight, Zap, Search, ThumbsUp, DollarSign } from "lucide-react";
import Link from "next/link";

// ── animation presets ─────────────────────────────────────────────────────────
const E: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── HOW BILLING WORKS steps ───────────────────────────────────────────────────
const steps = [
  {
    icon: <Zap size={24} className="text-[#4F6EF7]" />,
    title: "Connect your cloud",
    desc: "Read-only IAM role. One-click CloudFormation template. No agents, no write access.",
    badge: "Free",
    badgeColor: "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
  },
  {
    icon: <Search size={24} className="text-[#7C3AED]" />,
    title: "We scan and find savings",
    desc: "Continuous scanning of idle resources, regressions, and misconfigurations across your cloud.",
    badge: "Automated",
    badgeColor: "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20",
  },
  {
    icon: <ThumbsUp size={24} className="text-[#4F6EF7]" />,
    title: "You approve what to fix",
    desc: "Every remediation requires your explicit approval. We never touch anything without your say-so.",
    badge: "Your control",
    badgeColor: "bg-[#4F6EF7]/10 text-[#4F6EF7] border border-[#4F6EF7]/20",
  },
  {
    icon: <DollarSign size={24} className="text-[#10B981]" />,
    title: "We take 15% of verified savings only",
    desc: "Before/after CloudWatch metrics confirm the saving. We invoice 15% of what's verified. If savings are under $500, it rolls to next month.",
    badge: "15% only",
    badgeColor: "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
  },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "What counts as savings?",
    a: "AutoStopping idle dev/staging environments, cleaning up unused resources (EBS volumes, old snapshots, unattached IPs), catching deploy cost regressions before they compound, and fixing misconfigurations like oversized instance types or unnecessary data transfer.",
  },
  {
    q: "How do you verify savings?",
    a: "We use before/after CloudWatch metrics alongside resource cost data from AWS Cost Explorer. Every saving event is attributed to a specific resource and action, with timestamps and cost delta attached. You can audit every line item in your dashboard.",
  },
  {
    q: "What if I dispute a charge?",
    a: "Flag the line item directly in your dashboard. It's immediately excluded from your invoice and we open a manual review within 24 hours. If the dispute is valid, you pay nothing for that item — full stop.",
  },
  {
    q: "Is there a contract?",
    a: "No. Month-to-month, cancel anytime from your dashboard. No cancellation fees, no minimum commitment, no lock-in.",
  },
  {
    q: "What's the $500 minimum?",
    a: "If we save you less than $500 in a calendar month, we don't send a partial invoice — that savings amount rolls forward to the next month. This prevents annoying micro-charges and keeps billing predictable.",
  },
  {
    q: "What about enterprise?",
    a: "For teams with >$1M in projected annual savings, we can arrange custom billing structures, dedicated support, and SLA guarantees. Reach out at enterprise@cloudlinkglobal.com and we'll respond within one business day.",
  },
];

// ── ACCORDION item ─────────────────────────────────────────────────────────────
function AccordionItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[#1E2D4F] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-[#141C33] hover:bg-[#1a2440] transition-colors duration-200"
      >
        <span className="text-[#F1F5F9] font-medium pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-[#94A3B8] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 py-5 text-[#94A3B8] leading-relaxed border-t border-[#1E2D4F] bg-[#0F1629]">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  // calculator state
  const [spend, setSpend] = useState(50_000);
  // accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const wastePercent = 0.30;
  const savingsPercent = 0.70; // 70% of waste actually recovered
  const wasteFound = spend * wastePercent;
  const savingsGenerated = wasteFound * savingsPercent;
  const cloudlinkFee = savingsGenerated * 0.15;
  const netSavings = savingsGenerated - cloudlinkFee;

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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4F6EF7]/30 bg-[#4F6EF7]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#4F6EF7]">
              Pricing
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-[#F1F5F9]">
            We only get paid{" "}
            <span className="bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] bg-clip-text text-transparent">
              when you save money.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-12 max-w-xl mx-auto">
            15% of verified savings. Zero if we save you zero. That's it.
          </motion.p>

          {/* Giant 15% display */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 mb-12">
            <div className="text-8xl md:text-9xl font-black bg-gradient-to-br from-[#4F6EF7] via-[#7C3AED] to-[#4F6EF7] bg-clip-text text-transparent leading-none">
              15%
            </div>
            <p className="text-[#94A3B8] text-lg font-medium">of verified savings — nothing else, ever</p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#4F6EF7] hover:bg-[#3d5ce6] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4F6EF7]/25 transition-all duration-200"
            >
              Connect your cloud free <ArrowRight size={16} />
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#0F1629] hover:border-[#4F6EF7]/40 px-8 py-3.5 text-sm font-semibold text-[#94A3B8] transition-all duration-200"
            >
              See how it works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW BILLING WORKS ── */}
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
                How it works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">How billing works</h2>
              <p className="text-[#94A3B8] mt-3 max-w-lg mx-auto">Four steps. No surprises.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#1E2D4F] to-transparent z-0" />
                  )}
                  <div className="relative z-10 bg-[#141C33] border border-[#1E2D4F] rounded-2xl p-6 h-full flex flex-col gap-4 hover:border-[#4F6EF7]/40 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#0F1629] flex items-center justify-center">
                        {s.icon}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badgeColor}`}>
                        {s.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#4F6EF7] mb-1">Step {i + 1}</div>
                      <h3 className="text-[#F1F5F9] font-semibold mb-2">{s.title}</h3>
                      <p className="text-[#94A3B8] text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                Calculator
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">See what you'd save</h2>
              <p className="text-[#94A3B8] mt-3">Based on industry averages for AWS spend.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-[#141C33] border border-[#1E2D4F] rounded-2xl p-8">
              {/* Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[#94A3B8] text-sm font-medium">Monthly AWS spend</label>
                  <span className="text-[#F1F5F9] font-bold text-lg">{fmt(spend)}/mo</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={500_000}
                  step={1000}
                  value={spend}
                  onChange={(e) => setSpend(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4F6EF7 0%, #4F6EF7 ${((spend - 1000) / (500_000 - 1000)) * 100}%, #1E2D4F ${((spend - 1000) / (500_000 - 1000)) * 100}%, #1E2D4F 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
                  <span>$1K</span>
                  <span>$500K</span>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Waste found", value: fmt(wasteFound), sub: "~30% of cloud spend", color: "text-[#F1F5F9]" },
                  { label: "Savings generated", value: fmt(savingsGenerated), sub: "after remediation", color: "text-[#10B981]" },
                  { label: "Cloudlink fee (15%)", value: fmt(cloudlinkFee), sub: "of verified savings", color: "text-[#94A3B8]" },
                  { label: "Your net savings", value: fmt(netSavings), sub: "per month", color: "text-[#4F6EF7]" },
                ].map((r, i) => (
                  <div key={i} className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-4">
                    <div className="text-xs text-[#94A3B8] mb-1">{r.label}</div>
                    <div className={`text-2xl font-bold ${r.color}`}>{r.value}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">{r.sub}</div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#94A3B8] mt-6 text-center leading-relaxed">
                Estimates based on industry averages. Actual savings vary by environment. You only pay when we verify real savings.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT COUNTS AS SAVINGS — FAQ ACCORDION ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9]">What counts as savings?</h2>
              <p className="text-[#94A3B8] mt-3">Everything you'd want to know before connecting.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY NOT SUBSCRIPTION ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">
                Our philosophy
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-6">
              Why not a subscription?
            </motion.h2>

            <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-10 leading-relaxed max-w-2xl mx-auto">
              Subscriptions create misaligned incentives. A vendor on a fixed subscription gets paid whether or not they do anything for you.{" "}
              <span className="text-[#F1F5F9] font-semibold">We only win if you win.</span>
            </motion.p>

            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "No savings = no invoice",
                  desc: "If we don't find and verify real savings in a month, you pay exactly $0.",
                  icon: "💸",
                },
                {
                  title: "We're incentivized to find more",
                  desc: "More savings for you means more revenue for us. Our goals are perfectly aligned.",
                  icon: "🎯",
                },
                {
                  title: "No commitment required",
                  desc: "Month-to-month. Cancel anytime from your dashboard. No penalty, no questions.",
                  icon: "🔓",
                },
              ].map((p, i) => (
                <div key={i} className="bg-[#141C33] border border-[#1E2D4F] rounded-2xl p-6">
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-[#F1F5F9] font-semibold mb-2">{p.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
              Zero risk. Real savings.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#94A3B8] text-lg mb-8">
              Connect in minutes. If we don't save you money, you owe us nothing.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#4F6EF7] hover:bg-[#3d5ce6] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4F6EF7]/25 transition-all duration-200"
              >
                Start saving — it's free <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 text-sm text-[#94A3B8]">
              {["No credit card required", "Connect in 5 minutes", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#10B981]" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
