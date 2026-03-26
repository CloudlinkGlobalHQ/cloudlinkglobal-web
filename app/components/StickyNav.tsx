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
    <header
      className={[
        "sticky top-0 z-30 w-full transition-all duration-300",
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-slate-200 shadow-sm"
          : "bg-white/88 backdrop-blur-md border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <LogoMark size={26} />
          <div>
            <div className="text-sm font-bold tracking-tight text-gray-900">Cloudlink</div>
            <div className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">Deploy-aware FinOps</div>
          </div>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {items.map((it) => {
            const isActive = it.id === active;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                ].join(" ")}
              >
                {it.label}
              </a>
            );
          })}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/login"
            className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-green-600/20"
          >
            Request access
          </a>
        </div>
      </div>
    </header>
  );
}
