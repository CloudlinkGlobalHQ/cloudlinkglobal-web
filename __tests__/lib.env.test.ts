// @vitest-environment node
// Must run in Node (not jsdom) — env validation skips when window is defined.
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('lib/env – validateEnv', () => {
  it('does not throw during next build phase', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    vi.stubEnv('NODE_ENV', 'production')
    await expect(import('../app/lib/env')).resolves.toBeDefined()
  })

  it('does not throw in development even with missing vars', async () => {
    vi.stubEnv('NEXT_PHASE', '')
    vi.stubEnv('NODE_ENV', 'development')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(import('../app/lib/env')).resolves.toBeDefined()
    warnSpy.mockRestore()
  })

  it('throws in production runtime when required vars are absent', async () => {
    vi.stubEnv('NEXT_PHASE', '')
    vi.stubEnv('NODE_ENV', 'production')
    const requiredKeys = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_STARTER_PRICE_ID',
      'STRIPE_GROWTH_PRICE_ID',
    ]
    for (const k of requiredKeys) vi.stubEnv(k, '')
    await expect(import('../app/lib/env')).rejects.toThrow('Missing required environment variables')
  })

  it('does not throw in production when all required vars are present', async () => {
    vi.stubEnv('NEXT_PHASE', '')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc')
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_abc')
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_stripe')
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_stripe')
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
    vi.stubEnv('STRIPE_STARTER_PRICE_ID', 'price_starter')
    vi.stubEnv('STRIPE_GROWTH_PRICE_ID', 'price_growth')
    await expect(import('../app/lib/env')).resolves.toBeDefined()
  })
})
