import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted so mock functions persist across resetModules
const mockConstructEvent = vi.hoisted(() => vi.fn())

vi.mock('../app/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: vi.fn() },
  }),
}))

vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
vi.stubEnv('CLOUDLINK_API_URL', 'https://api.cloudlink.test')

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => ({}) }))
})

async function callWebhook(body: string, headers: Record<string, string>) {
  const { POST } = await import('../app/api/stripe/webhook/route')
  return POST(
    new Request('https://cloudlinkglobal.com/api/stripe/webhook', {
      method: 'POST',
      body,
      headers,
    }),
  )
}

describe('POST /api/stripe/webhook', () => {
  it('returns 503 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '')
    vi.resetModules()
    const res = await callWebhook('{}', { 'stripe-signature': 'sig' })
    expect(res.status).toBe(503)
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await callWebhook('{}', {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/missing stripe-signature/i)
  })

  it('returns 400 when signature verification throws', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature mismatch')
    })
    const res = await callWebhook('{}', { 'stripe-signature': 'bad-sig' })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid signature')
  })

  it('returns 200 for an unhandled event type', async () => {
    mockConstructEvent.mockReturnValue({ type: 'some.unknown.event', data: { object: {} } })
    const res = await callWebhook('{}', { 'stripe-signature': 'valid-sig' })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })

  it('returns 200 for checkout.session.completed with missing clerk_user_id (graceful)', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {},
          customer: 'cus_test',
          subscription: 'sub_test',
        },
      },
    })
    const res = await callWebhook('{}', { 'stripe-signature': 'valid-sig' })
    // Should not crash — missing user ID is handled gracefully
    expect(res.status).toBe(200)
  })
})
