"use client";

import { useState, useEffect } from "react";
import { Zap, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/customers", label: "Customers" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return null;

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-[#1E2D4F] shadow-lg shadow-black/20"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-[1280px] px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/30 group-hover:shadow-[#10B981]/50 transition-all duration-200">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="text-[#F1F5F9] font-bold text-lg tracking-tight">Cloudlink</span>
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-[#10B981] bg-[#10B981]/10"
                      : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141C33]",
                  ].join(" ")}
                >
                  {link.label}
                  {isActive && (
                    <span className="block h-0.5 bg-[#10B981] rounded-full mt-0.5 mx-auto" style={{ width: "80%" }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors rounded-lg hover:bg-[#141C33]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-gradient px-5 py-2 text-sm font-semibold text-white rounded-lg inline-flex items-center gap-2"
            >
              <Zap size={14} className="fill-white" />
              Start Saving
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141C33] transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0E1A]/98 backdrop-blur-xl flex flex-col pt-20 px-6 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-4 text-lg font-medium text-[#F1F5F9] border-b border-[#1E2D4F] hover:text-[#10B981] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login" className="btn-ghost px-6 py-3 text-center text-sm font-medium">
              Sign in
            </Link>
            <Link href="/signup" className="btn-gradient px-6 py-3 text-center text-sm font-semibold text-white">
              Start Saving — It&apos;s Free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
