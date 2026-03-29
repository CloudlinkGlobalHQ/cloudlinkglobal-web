/**
 * Environment variable validation.
 * Called at module load time so misconfiguration fails fast at startup,
 * not silently at runtime when a user hits an affected code path.
 */

type EnvVar = {
  key: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  // Auth
  { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', required: true, description: 'Clerk publishable key' },
  { key: 'CLERK_SECRET_KEY', required: true, description: 'Clerk secret key' },
  // Stripe
  { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable key' },
  { key: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook signing secret' },
  { key: 'STRIPE_STARTER_PRICE_ID', required: true, description: 'Stripe Starter plan price ID' },
  { key: 'STRIPE_GROWTH_PRICE_ID', required: true, description: 'Stripe Growth plan price ID' },
  { key: 'STRIPE_METERED_PRICE_ID', required: true, description: 'Stripe metered (performance) price ID' },
  // Billing cron
  { key: 'CRON_SECRET', required: true, description: 'Secret for month-end billing cron' },
  // Backend
  { key: 'NEXT_PUBLIC_API_URL', required: false, description: 'Cloudlink agents backend URL' },
]

function validateEnv(): void {
  // Only validate on the server (not in the browser bundle)
  if (typeof window !== 'undefined') return
  // Skip during `next build` — build machines don't have runtime secrets.
  // NEXT_PHASE is set to 'phase-production-build' by Next.js during builds.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const missing: string[] = []

  for (const { key, required, description } of ENV_VARS) {
    const value = process.env[key]
    if (required && (!value || value === '')) {
      missing.push(`  ${key}  — ${description}`)
    }
  }

  if (missing.length > 0) {
    const list = missing.join('\n')
    // In production runtime, throw so the missing config is immediately visible.
    // In development, warn so engineers can run locally without full credentials.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables:\n${list}`)
    } else {
      console.warn(`[env] Missing environment variables (non-fatal in development):\n${list}`)
    }
  }
}

validateEnv()

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app',
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    starterPriceId: process.env.STRIPE_STARTER_PRICE_ID!,
    growthPriceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    meteredPriceId: process.env.STRIPE_METERED_PRICE_ID!,
  },
  cronSecret: process.env.CRON_SECRET!,
} as const
