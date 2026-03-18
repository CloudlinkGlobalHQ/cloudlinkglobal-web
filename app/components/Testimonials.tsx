"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const testimonials = [
  {
    quote: "We had a Lambda function quietly 4x-ing our bill for two weeks before we noticed. Cloudlink would have caught it the same day deploy #183 went out.",
    name: "Marcus T.",
    role: "Staff Engineer",
    company: "Series B fintech",
    avatar: "MT",
  },
  {
    quote: "Our infra costs went up 40% in Q3 and we had no idea which service caused it. Now every deploy is accounted for. It's the observability gap nobody talked about.",
    name: "Priya N.",
    role: "VP Engineering",
    company: "YC W23 startup",
    avatar: "PN",
  },
  {
    quote: "The fact that it's read-only was the dealbreaker for us in a good way. Security team approved it in a day. Other tools required write access we were never going to grant.",
    name: "Daniel K.",
    role: "Platform Lead",
    company: "Healthcare SaaS",
    avatar: "DK",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: E }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-700 mb-4">
            What teams say
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Engineering teams that felt the pain</h2>
          <p className="mt-3 mx-auto max-w-xl text-gray-500">Early access members on the problem Cloudlink solves.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: E }}
              className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#16a34a">
                    <path d="M7 1l1.56 3.16L12 4.73l-2.5 2.44.59 3.45L7 8.97l-3.09 1.65.59-3.45L2 4.73l3.44-.57L7 1z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 border border-green-200 text-[11px] font-bold text-green-700">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.name}</div>
                  <div className="text-[11px] text-gray-400">{t.role} · {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
