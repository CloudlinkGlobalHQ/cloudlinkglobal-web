"use client";

import { motion } from "framer-motion";

const E: [number, number, number, number] = [0.22, 1, 0.36, 1];

const testimonials = [
  {
    quote:
      "We had a Lambda function quietly 4x-ing our bill for two weeks before we noticed. Cloudlink would have caught it the same day deploy #183 went out.",
    name: "Marcus T.",
    role: "Staff Engineer",
    company: "Series B fintech",
    avatar: "MT",
    accent: "from-indigo-500/20 to-violet-500/20",
  },
  {
    quote:
      "Our infra costs went up 40% in Q3 and we had no idea which service caused it. Now every deploy is accounted for. It's the observability gap nobody talked about.",
    name: "Priya N.",
    role: "VP Engineering",
    company: "YC W23 startup",
    avatar: "PN",
    accent: "from-violet-500/20 to-purple-500/20",
  },
  {
    quote:
      "The fact that it's read-only was the dealbreaker for us in a good way. Security team approved it in a day. Other tools required write access we were never going to grant.",
    name: "Daniel K.",
    role: "Platform Lead",
    company: "Healthcare SaaS",
    accent: "from-purple-500/20 to-indigo-500/20",
    avatar: "DK",
  },
];

export default function Testimonials() {
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
          What teams say
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Engineering teams that felt the pain
        </h2>
        <p className="mt-3 mx-auto max-w-xl text-white/50">
          Early access members on the problem Cloudlink solves.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: E }}
            className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.06)] overflow-hidden"
          >
            {/* Subtle gradient bg */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-40 rounded-2xl`} />

            {/* Stars */}
            <div className="relative flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <svg key={j} width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1l1.236 2.506L10 3.927l-2 1.948.472 2.75L6 7.25l-2.472 1.375L4 5.875 2 3.927l2.764-.421L6 1z"
                    fill="rgba(99,102,241,0.8)"
                  />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="relative text-sm leading-relaxed text-white/65 flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="relative flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-white/10 text-[10px] font-bold text-white/70">
                {t.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80">{t.name}</div>
                <div className="text-[11px] text-white/35">
                  {t.role} · {t.company}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
