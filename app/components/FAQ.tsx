"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const faqs = [
  { q: "Do you need write access to my AWS account?", a: "No — never. Cloudlink only requires a read-only IAM role with access to AWS Cost Explorer and CloudTrail. We cannot make any changes to your infrastructure. Every API call we make is visible in your CloudTrail logs." },
  { q: "Does it work with GitHub Actions, CircleCI, or custom pipelines?", a: "Yes. Cloudlink uses AWS Cost Explorer data to detect cost changes after deploys — it doesn't integrate directly with your CI/CD pipeline. You can optionally send a webhook when a deploy completes for faster correlation, but it works without any pipeline changes." },
  { q: "How is this different from AWS Cost Anomaly Detection?", a: "AWS Cost Anomaly Detection alerts you when spending is unusual, but doesn't tell you which deploy caused it. Cloudlink correlates cost changes to specific deploy windows per service, so you know exactly what to roll back or investigate." },
  { q: "How long does setup take?", a: "Under 5 minutes. You create a scoped IAM role using our CloudFormation template (one click), connect it in Cloudlink, and we start building your cost baselines immediately. No agents, no code changes, no infrastructure modifications." },
  { q: "What happens to my data?", a: "We access AWS cost signals only — never application logs, database contents, or customer data. Cost data is stored encrypted and used solely to compute regression baselines for your account. You can revoke access and delete your data at any time." },
  { q: "When will paid plans start?", a: "We're in beta with no fixed end date. When we launch paid plans, all early access members will be notified in advance and receive a 40% discount locked in for life." },
];

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.05, ease: E }}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${open ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white hover:border-green-200"}`}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className={`shrink-0 h-5 w-5 rounded-full border flex items-center justify-center text-sm font-bold ${open ? "border-green-300 bg-green-100 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
          +
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: E }} className="overflow-hidden">
            <p className="px-5 pb-4 text-sm leading-relaxed text-gray-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: E }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-4">FAQ</div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Common questions</h2>
          <p className="mt-3 mx-auto max-w-xl text-gray-500">Everything you need to know before connecting your AWS account.</p>
        </motion.div>
        <div className="mx-auto max-w-2xl space-y-2">
          {faqs.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} i={i} />)}
        </div>
      </div>
    </section>
  );
}
