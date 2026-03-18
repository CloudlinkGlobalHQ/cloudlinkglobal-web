"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const faqs = [
  {
    q: "Do you need write access to my AWS account?",
    a: "No — never. Cloudlink only requires a read-only IAM role with access to AWS Cost Explorer and CloudTrail. We cannot make any changes to your infrastructure. Every API call we make is visible in your CloudTrail logs.",
  },
  {
    q: "Does it work with GitHub Actions, CircleCI, or custom deploy pipelines?",
    a: "Yes. Cloudlink uses AWS Cost Explorer data to detect cost changes after deploys — it doesn't integrate directly with your CI/CD pipeline. You can optionally send a webhook when a deploy completes to get faster correlation, but it works without any pipeline changes.",
  },
  {
    q: "How is this different from AWS Cost Anomaly Detection?",
    a: "AWS Cost Anomaly Detection alerts you when spending is unusual, but it doesn't tell you which deploy caused it. Cloudlink correlates cost changes to specific deploy windows per service, so you know exactly what to roll back or investigate.",
  },
  {
    q: "How long does setup take?",
    a: "Under 5 minutes. You create a scoped IAM role using our CloudFormation template (one click), connect it in Cloudlink, and we start building your cost baselines immediately. No agents, no code changes, no infrastructure modifications.",
  },
  {
    q: "What happens to my data?",
    a: "We access AWS cost signals only — never application logs, database contents, or customer data. Cost data is stored encrypted and used solely to compute regression baselines for your account. You can revoke access and delete your data at any time.",
  },
  {
    q: "When will paid plans start?",
    a: "We're in beta with no fixed end date. When we launch paid plans, all early access members will be notified in advance and receive a 40% discount locked in for life.",
  },
];

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: i * 0.06, ease: E }}
      className={[
        "rounded-xl border transition-all duration-200 overflow-hidden",
        open ? "border-indigo-500/30 bg-indigo-500/[0.04]" : "border-white/8 bg-white/[0.02] hover:border-white/14",
      ].join(" ")}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white/80">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-0.5 shrink-0 text-white/35 text-lg leading-none"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: E }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-white/50">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: E }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-300 mb-4">
          FAQ
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Common questions</h2>
        <p className="mt-3 mx-auto max-w-xl text-white/50">
          Everything you need to know before connecting your AWS account.
        </p>
      </motion.div>

      <div className="mx-auto max-w-2xl space-y-2">
        {faqs.map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} i={i} />
        ))}
      </div>
    </section>
  );
}
