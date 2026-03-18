"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: string; label: string };

export default function StickyNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // choose the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root: null, threshold: [0.15, 0.25, 0.35], rootMargin: "-25% 0px -60% 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return (
    <div className="sticky top-0 z-30 -mx-6 px-6 py-4 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
        <div className="text-sm font-semibold tracking-tight text-white/90">Cloudlink</div>

        <div className="hidden sm:flex items-center gap-2">
          {items.map((it) => {
            const isActive = it.id === active;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition border",
                  isActive
                    ? "bg-white/10 border-white/25 text-white"
                    : "bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/25",
                ].join(" ")}
              >
                {it.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a href="/login" className="rounded-full border border-white/20 bg-white/0 px-3 py-1.5 text-xs font-semibold hover:border-white/40 hover:bg-white/5 transition">
            Sign in
          </a>
          <a href="#waitlist" className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold transition">
            Join early access
          </a>
        </div>
      </div>
    </div>
  );
}
