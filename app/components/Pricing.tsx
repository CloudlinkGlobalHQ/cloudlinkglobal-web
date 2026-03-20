"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const betaFeatures = [
  "Unlimited deploys tracked",
  "Up to 10 AWS services monitored",
  "Slack + email alerts",
  "Deploy-linked regression reports",
  "Historical cost baseline (90 days)",
  "Priority onboarding support",
];

const plans = [
  {
    name: "Starter",
    price: "$29",
    per: "/mo",
    desc: "Small teams, up to 3 AWS services",
    features: ["3 AWS services", "Deploy regression alerts", "Slack + email", "7-day history"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$99",
    per: "/mo",
    desc: "Scaling teams with multiple services",
    features: ["20 AWS services", "Webhook integrations", "90-day history", "Team seats (5)", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    desc: "Unlimited services + SLA + SSO",
    features: ["Unlimited services", "SOC 2 compliance docs", "Dedicated onboarding", "SLA guarantee", "SSO / SAML"],
    cta: "Contact us",
    highlight: false,
  },
];

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!isSignedIn) {
      window.location.href = "/login";
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Could not create checkout session");
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: E }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Free during beta</h2>
          <p className="mt-3 mx-auto max-w-xl text-gray-500">
            Full access, no credit card required. Early members lock in <span className="text-green-700 font-semibold">40% off</span> when paid plans launch.
          </p>
        </motion.div>

        {/* Beta banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: E }}
          className="mb-10 rounded-2xl border border-green-200 bg-green-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase tracking-wider">
                Active now
              </span>
              <span className="text-sm font-bold text-gray-900">Beta Access — $0/mo</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {betaFeatures.map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <a href="#waitlist" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm">
            Get free beta access →
          </a>
        </motion.div>

        {/* Paid plans */}
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: E }}
              className={[
                "relative rounded-2xl border p-6 flex flex-col",
                plan.highlight
                  ? "border-green-300 bg-white shadow-lg shadow-green-100/60 ring-1 ring-green-300/50"
                  : "border-gray-200 bg-white shadow-sm",
              ].join(" ")}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">Most popular</span>
                </div>
              )}
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.per && <span className="text-sm text-gray-400">{plan.per}</span>}
                </div>
                <p className="mt-1.5 text-sm text-gray-500">{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.name === "Enterprise" ? window.location.href = "mailto:satvikranga60@gmail.com?subject=Cloudlink Enterprise" : handleCheckout(plan.name.toLowerCase())}
                disabled={loading === plan.name.toLowerCase()}
                className={[
                  "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
                  plan.highlight
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    : "border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 hover:bg-green-50",
                ].join(" ")}
              >
                {loading === plan.name.toLowerCase() ? "Redirecting…" : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Beta members get 40% off their chosen plan when paid tiers launch — locked in forever.
        </p>
      </div>
    </section>
  );
}
