import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockAuth = vi.hoisted(() => vi.fn())
const mockSessionCreate = vi.hoisted(() => vi.fn())

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
vi.mock('../app/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockSessionCreate } },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  vi.stubEnv('STRIPE_STARTER_PRICE_ID', 'price_starter_test')
  vi.stubEnv('STRIPE_GROWTH_PRICE_ID', 'price_growth_test')
  mockAuth.mockResolvedValue({ userId: 'user_test' })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function callCheckout(body: object) {
  const { POST } = await import('../app/api/stripe/checkout/route')
  return POST(
    new Request('https://cloudlinkglobal.com/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://cloudlinkglobal.com' },
      body: JSON.stringify(body),
    }),
  )
}

describe('POST /api/stripe/checkout', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    const res = await callCheckout({ plan: 'starter' })
    expect(res.status).toBe(401)
  })

  it('returns 503 when price ID is not configured for plan', async () => {
    vi.stubEnv('STRIPE_STARTER_PRICE_ID', '')
    const res = await callCheckout({ plan: 'starter' })
    expect(res.status).toBe(503)
  })

  it('returns the checkout session URL on success', async () => {
    mockSessionCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/test_session',
    })
    const res = await callCheckout({ plan: 'starter' })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/pay/test_session')
  })

  it('passes the correct price ID for the growth plan', async () => {
    mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/growth' })
    await callCheckout({ plan: 'growth' })
    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({ price: 'price_growth_test' }),
        ]),
      }),
    )
  })

  it('returns 500 on Stripe API error', async () => {
    mockSessionCreate.mockRejectedValue(new Error('Stripe rate limit'))
    const res = await callCheckout({ plan: 'starter' })
    expect(res.status).toBe(500)
  })
})
