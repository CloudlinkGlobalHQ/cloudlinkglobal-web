import { describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', () => ({ default: () => () => null }))
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

import { needsClerk } from '../app/components/AppProviders'

describe('needsClerk', () => {
  it('wraps sign-in and sign-up flows including their follow-up steps', () => {
    for (const p of ['/login', '/login/factor-one', '/signup', '/signup/verify-email-address', '/dashboard', '/dashboard/settings']) {
      expect(needsClerk(p)).toBe(true)
    }
  })

  it('skips marketing pages', () => {
    for (const p of ['/', '/pricing', '/docs', '/signups', '/terms', null]) {
      expect(needsClerk(p as string | null)).toBe(false)
    }
  })
})
