"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await fetch("https://formspree.io/f/mlgnlgze", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Form submit failed");

      // ✅ stay on Cloudlink and go to your thank-you page
      window.location.href = "/thanks";
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200";

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
      <input name="name" required className={inputCls} placeholder="Your name" />
      <input name="email" type="email" required className={inputCls} placeholder="Work email" />
      <input
        name="company"
        className={`${inputCls} md:col-span-2`}
        placeholder="Company (optional)"
      />

      <button
        type="submit"
        disabled={loading}
        className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </>
        ) : (
          "Request early access →"
        )}
      </button>

      {error && (
        <p className="md:col-span-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
