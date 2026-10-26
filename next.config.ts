import type { NextConfig } from "next";
import path from "path";

// Full Content-Security-Policy, shipped in Report-Only mode first so a missed
// third-party domain (Clerk, Stripe, PostHog) shows up as a console report
// instead of breaking sign-in. Promote it to an enforced header once the
// browser console on /login, /signup and /dashboard is clean.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.cloudlinkglobal.com https://challenges.cloudflare.com https://js.stripe.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com https://*.stripe.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudlink-agents.onrender.com https://*.clerk.accounts.dev https://clerk.cloudlinkglobal.com https://api.stripe.com https://*.posthog.com",
  "frame-src https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Enforced now: only stops other sites from framing this one.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // HSTS is already sent by Vercel for this domain.
];

// End-to-end tests run the dashboard without Clerk keys by swapping Clerk for
// a stub (e2e/clerk-stub). This bypasses sign-in, so it must never reach Vercel.
const e2eClerkStub = process.env.CLOUDLINK_E2E_CLERK_STUB === "1";
if (e2eClerkStub && (process.env.VERCEL || process.env.VERCEL_ENV)) {
  throw new Error("CLOUDLINK_E2E_CLERK_STUB must not be set on Vercel: it disables authentication.");
}

const nextConfig: NextConfig = {
  // Keep the stubbed e2e build apart from the real one.
  ...(e2eClerkStub && { distDir: ".next-e2e" }),
  turbopack: {
    root: path.resolve(__dirname),
    ...(e2eClerkStub && {
      resolveAlias: {
        "@clerk/nextjs/server": "./e2e/clerk-stub/server.ts",
        "@clerk/nextjs": "./e2e/clerk-stub/index.tsx",
      },
    }),
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.cloudlinkglobal.com" }],
        destination: "https://cloudlinkglobal.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
