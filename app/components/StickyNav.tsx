"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "./Logo";

type Item = { id: string; label: string };

export default function StickyNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [scrolled, setScrolled] = useState(false);

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
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
    <div
      className={[
        "sticky top-0 z-30 -mx-6 px-6 py-3 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-[#040410]/80 border-b border-white/8 shadow-[0_1px_0_0_rgba(255,255,255,0.05)]"
          : "backdrop-blur-md bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2 group">
          <LogoMark size={28} />
          <span className="text-sm font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            Cloudlink
          </span>
        </a>

        {/* Section nav pills */}
        <div className="hidden sm:flex items-center gap-1">
          {items.map((it) => {
            const isActive = it.id === active;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5",
                ].join(" ")}
              >
                {it.label}
              </a>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="rounded-full border border-white/15 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-white/30 hover:text-white transition-all duration-200"
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            className="rounded-full bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 text-xs font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            Early access
          </a>
        </div>
      </div>
    </div>
  );
}
