"use client";

import { motion } from "framer-motion";
import {
  Cloud, Search, Lock, MessageSquare, Bell, Check, ArrowRight,
} from "lucide-react";
import Link from "next/link";


// ── animation ─────────────────────────────────────────────────────────────────
const E: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: E } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ── example label ─────────────────────────────────────────────────────────────
function ExampleTag() {
  return (
    <span className="rounded-full border border-[#274064] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#9FB0C9]">
      Example
    </span>
  );
}

// ── scan coverage visual ──────────────────────────────────────────────────────
function ScanCard() {
  const services = [
    { name: "EC2 + EBS", check: "Idle instances, unattached volumes" },
    { name: "RDS", check: "Stopped, public or unencrypted databases" },
    { name: "Lambda", check: "Functions with no recent invocations" },
    { name: "S3", check: "Public access block, encryption, versioning" },
    { name: "Security groups", check: "Ports open to the internet" },
    { name: "Cost Explorer", check: "Month-to-date cost by service" },
  ];
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="text-xs text-[#94A3B8] font-mono mb-2">What each scan checks</div>
      {services.map((c) => (
        <div key={c.name} className="flex items-center justify-between gap-4 bg-[#141C33] border border-[#1E2D4F] rounded-xl px-4 py-3">
          <span className="text-[#F1F5F9] font-semibold text-sm">{c.name}</span>
          <span className="text-[#94A3B8] text-xs text-right">{c.check}</span>
        </div>
      ))}
    </div>
  );
}

// ── findings visual ───────────────────────────────────────────────────────────
function FindingsCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#94A3B8] font-mono">Findings</span>
        <ExampleTag />
      </div>
      {[
        { issue: "EC2 instance, average CPU 1.8% for 14 days", fix: "Stop or downsize", saving: "$61/mo" },
        { issue: "200 GB EBS volume not attached to anything", fix: "Snapshot, then delete", saving: "$16/mo" },
        { issue: "RDS instance stopped for 30 days", fix: "Snapshot, then delete", saving: "Storage cost" },
      ].map((item) => (
        <div key={item.issue} className="bg-[#141C33] border border-[#1E2D4F] rounded-xl p-3">
          <div className="text-xs text-[#94A3B8] mb-1">{item.issue}</div>
          <div className="flex items-center justify-between">
            <span className="text-[#F1F5F9] text-sm">→ {item.fix}</span>
            <span className="text-[#10B981] text-xs font-semibold">{item.saving}</span>
          </div>
        </div>
      ))}
      <div className="text-xs text-[#64748B]">You apply the fixes. Cloudlink can&apos;t change your account.</div>
    </div>
  );
}

// ── notifications visual ──────────────────────────────────────────────────────
function NotifyCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#94A3B8] font-mono">Notifications</span>
        <ExampleTag />
      </div>
      {[
        { channel: "Weekly email digest", msg: "5 new findings · est. $214/mo in savings" },
        { channel: "Slack #eng-alerts", msg: "Scan finished: 3 idle resources, 1 open port" },
        { channel: "Webhook", msg: "scan.finished delivered to your endpoint" },
      ].map((n) => (
        <div key={n.channel} className="bg-[#141C33] border border-[#1E2D4F] rounded-xl px-3 py-2.5">
          <div className="text-xs font-semibold text-[#94A3B8]">{n.channel}</div>
          <div className="text-xs text-[#F1F5F9] mt-0.5">{n.msg}</div>
        </div>
      ))}
    </div>
  );
}

// ── AI questions visual ───────────────────────────────────────────────────────
function AdvisorCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#94A3B8] font-mono">Ask about your costs</span>
        <ExampleTag />
      </div>
      {[
        { role: "user", msg: "Why is my EC2 bill so high?" },
        { role: "ai", msg: "Most of the increase is EC2. Two instances in us-east-1 have averaged under 2% CPU for two weeks; stopping them would save about $120 a month." },
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

// ── read-only visual ──────────────────────────────────────────────────────────
function ReadOnlyCard() {
  return (
    <div className="bg-[#0A0E1A] border border-[#1E2D4F] rounded-2xl p-6 font-mono text-xs space-y-2">
      <div className="text-[#94A3B8] mb-2">CloudFormation role · 22 actions</div>
      {["ec2:DescribeInstances", "ec2:DescribeVolumes", "cloudwatch:GetMetricStatistics", "ce:GetCostAndUsage", "rds:DescribeDBInstances", "lambda:ListFunctions", "s3:GetBucketEncryption", "…"].map((a) => (
        <div key={a} className="text-[#F1F5F9]">{a}</div>
      ))}
      <div className="mt-3 pt-3 border-t border-[#1E2D4F] text-[#10B981]">No write, delete or data-read permissions</div>
    </div>
  );
}

// ── feature data ──────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Cloud size={22} className="text-[#059669]" />,
    title: "Scans your AWS account",
    desc: "Cloudlink checks the services where small teams most often waste money, and repeats the check on a schedule so new waste shows up without you looking for it.",
    bullets: [
      "EC2, EBS, RDS, Lambda, S3 and security groups",
      "Your cost by service from Cost Explorer",
      "Idle detection from CloudWatch usage metrics",
    ],
    visual: <ScanCard />,
  },
  {
    icon: <Search size={22} className="text-[#10B981]" />,
    title: "A list of fixes with a dollar amount",
    desc: "Every finding says what's wrong, what to do about it, and roughly what it would save per month, based on AWS list prices.",
    bullets: [
      "Idle instances and unattached volumes",
      "Stopped or forgotten databases",
      "Risky settings like open ports or public buckets",
    ],
    visual: <FindingsCard />,
  },
  {
    icon: <Bell size={22} className="text-[#059669]" />,
    title: "Weekly digest and notifications",
    desc: "A weekly email summary of what Cloudlink found, plus Slack or webhook notifications when a scan finishes. Cost-spike alerts tied to deploys are in development.",
    bullets: [
      "Weekly email digest",
      "Slack and webhook notifications",
      "Month-to-date cost by service in the dashboard",
    ],
    visual: <NotifyCard />,
  },
  {
    icon: <MessageSquare size={22} className="text-[#10B981]" />,
    title: "Ask questions in plain English",
    desc: "Ask about your spend in the dashboard and get answers based on your own scan data.",
    bullets: [
      "Plain-English cost questions",
      "Answers grounded in your scan results",
      "Suggestions you can act on yourself",
    ],
    visual: <AdvisorCard />,
  },
  {
    icon: <Lock size={22} className="text-[#10B981]" />,
    title: "Read-only by design",
    desc: "The role you create can describe, get and list, and nothing else. It can't read your files or database records, and it can't change anything. An automated test fails if the old write permissions, like stopping instances or deleting volumes, are ever added back.",
    bullets: [
      "22 Describe, Get and List permissions",
      "Locked to an External ID only you have",
      "Delete the stack and access ends immediately",
    ],
    visual: <ReadOnlyCard />,
  },
];

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
            Find AWS waste{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              without giving up control
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-8">
            Cloudlink reads how your AWS account is set up and what it costs, then tells you what&apos;s being wasted and what each fix would save. It never changes anything; your team decides what to fix.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pilot"
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#059669] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
              Try the free pilot <ArrowRight size={16} />
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

      {/* ── AWS TOOLS ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-6 text-center">What about AWS&apos;s own tools?</h2>
          <p className="text-[#94A3B8] text-lg leading-8">
            AWS Cost Explorer, Trusted Advisor and Compute Optimizer are useful, and Cloudlink uses some of the same data.
            The difference is that they&apos;re spread across several consoles, and most small teams rarely open them.
            Cloudlink puts the waste in one list with a monthly dollar amount on each item and sends you a weekly summary.
          </p>
          <p className="text-[#94A3B8] text-lg leading-8 mt-4">
            Cloudlink works with AWS only, and doesn&apos;t yet cover VPC and NAT gateways, load balancers, DynamoDB, Kinesis,
            ElastiCache, OpenSearch or Bedrock.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-4">
              See what your AWS account is wasting
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#94A3B8] text-lg mb-8">
              The fall 2026 pilot is free and read-only. Setup takes about 5 minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/pilot"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] hover:bg-[#059669] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-all duration-200"
              >
                Try the free pilot <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
