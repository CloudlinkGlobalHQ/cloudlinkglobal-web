import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockMeterCreate = vi.hoisted(() => vi.fn())

vi.mock('../app/lib/stripe', () => ({
  getStripe: () => ({
    billing: {
      meterEvents: { create: mockMeterCreate },
    },
    subscriptionItems: {
      createUsageRecord: vi.fn().mockResolvedValue({}),
    },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  // All env vars the route reads at module-evaluation time
  vi.stubEnv('CRON_SECRET', 'valid-cron-secret')
  vi.stubEnv('CLOUDLINK_API_URL', 'https://api.cloudlink.test')
  vi.stubEnv('STRIPE_METERED_PRICE_ID', 'price_metered_test')
  vi.stubEnv('CLOUDLINK_WEBHOOK_SECRET', 'sync-secret-test')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function callMonthEnd(authHeader?: string) {
  const { POST } = await import('../app/api/billing/month-end/route')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authHeader !== undefined) headers['Authorization'] = authHeader
  return POST(
    new Request('https://cloudlinkglobal.com/api/billing/month-end', {
      method: 'POST',
      headers,
    }),
  )
}

describe('POST /api/billing/month-end', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await callMonthEnd()
    expect(res.status).toBe(401)
  })

  it('returns 401 when the cron secret does not match', async () => {
    const res = await callMonthEnd('Bearer wrong-secret')
    expect(res.status).toBe(401)
  })

  it('returns 200 with empty results when no pending subscriptions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        // Route destructures { customers } from the response
        json: () => Promise.resolve({ customers: [] }),
      }),
    )
    const res = await callMonthEnd('Bearer valid-cron-secret')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.billed).toBe(0)
    expect(json.rolledOver).toBe(0)
  })

  it('rolls over a subscription below the $500 threshold', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          // $50 savings — below $500 threshold → rollover
          json: () => Promise.resolve({
            customers: [
              {
                customer_id: 'cus_1',
                stripe_subscription_item_id: 'si_1',
                total_pending_savings_usd: 50,
                rollover_usd: 0,
                event_ids: ['evt_1'],
              },
            ],
          }),
        })
        .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
    )

    const res = await callMonthEnd('Bearer valid-cron-secret')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.rolledOver).toBeGreaterThanOrEqual(1)
    expect(json.billed).toBe(0)
  })

  it('bills a subscription at or above the $500 threshold', async () => {
    mockMeterCreate.mockResolvedValue({ identifier: 'me_test' })

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          // $600 savings — at or above $500 threshold → billed
          json: () => Promise.resolve({
            customers: [
              {
                customer_id: 'cus_1',
                stripe_subscription_item_id: 'si_1',
                total_pending_savings_usd: 600,
                rollover_usd: 0,
                event_ids: ['evt_1', 'evt_2'],
              },
            ],
          }),
        })
        .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
    )

    const res = await callMonthEnd('Bearer valid-cron-secret')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.billed).toBeGreaterThanOrEqual(1)
  })
})
