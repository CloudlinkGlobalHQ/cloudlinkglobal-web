import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const BACKEND_SYNC_SECRET =
  process.env.CLOUDLINK_WEBHOOK_SECRET ||
  process.env.CLOUDLINK_SYNC_SECRET ||
  process.env.CLOUDLINK_SUPERADMIN_KEY ||
  ''
const CRON_SECRET = process.env.CRON_SECRET || ''

// Minimum savings threshold before we bill (in USD).
const BILLING_THRESHOLD_USD = 500
// Cloudlink commission rate.
const COMMISSION_RATE = 0.15

// POST /api/billing/month-end
//
// Called by Vercel Cron on the last day of each month (23:55 UTC).
// For each customer with pending savings:
//   - If total savings >= $500 → report usage to Stripe (triggers auto-invoice for 15%)
//   - If total savings < $500  → mark as rollover (accumulate to next month)
//
// Secured by Authorization: Bearer {CRON_SECRET}
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!BACKEND_SYNC_SECRET) {
    return NextResponse.json({ error: 'Backend secret not configured' }, { status: 503 })
  }

  const results: { customer_id: string; action: string; savings_usd?: number; fee_usd?: number; error?: string }[] = []

  try {
    // 1. Fetch all customers with unbilled savings from backend
    const pendingRes = await fetch(`${API_URL}/savings/pending-billing`, {
      headers: { Authorization: `Bearer ${BACKEND_SYNC_SECRET}` },
      cache: 'no-store',
    })

    if (!pendingRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch pending billing data from backend' }, { status: 502 })
    }

    const { customers } = await pendingRes.json() as {
      customers: {
        customer_id: string
        stripe_subscription_item_id: string
        total_pending_savings_usd: number
        rollover_usd: number
        event_ids: string[]
      }[]
    }

    if (!customers?.length) {
      return NextResponse.json({ ok: true, billed: 0, rolledOver: 0, results: [] })
    }

    let billedCount = 0
    let rolledOverCount = 0

    for (const customer of customers) {
      const {
        customer_id,
        stripe_subscription_item_id,
        total_pending_savings_usd,
        rollover_usd,
        event_ids,
      } = customer

      const totalSavings = total_pending_savings_usd + (rollover_usd || 0)

      try {
        if (totalSavings < BILLING_THRESHOLD_USD) {
          // Below threshold — roll over to next month
          await fetch(`${API_URL}/savings/rollover`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${BACKEND_SYNC_SECRET}`,
            },
            body: JSON.stringify({ customer_id, event_ids }),
          })
          results.push({ customer_id, action: 'rollover', savings_usd: totalSavings })
          rolledOverCount++
        } else {
          // At or above threshold — report fee to Stripe as usage
          const feeUsd = totalSavings * COMMISSION_RATE
          const feeCents = Math.round(feeUsd * 100)

          if (!stripe_subscription_item_id) {
            results.push({ customer_id, action: 'error', error: 'No stripe_subscription_item_id on record' })
            continue
          }

          // Report usage via Stripe Billing Meters API (SDK v14+ approach).
          // We send feeCents as the value; the meter aggregates by sum over the billing period.
          const stripe = getStripe()
          await stripe.billing.meterEvents.create({
            event_name: process.env.STRIPE_METER_EVENT_NAME || 'cloudlink_savings_fee',
            payload: {
              value: String(feeCents),
              stripe_customer_id: customer_id, // Stripe resolves which subscription to bill
            },
            timestamp: Math.floor(Date.now() / 1000),
          })

          // Mark events as billed in backend
          await fetch(`${API_URL}/savings/mark-billed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${BACKEND_SYNC_SECRET}`,
            },
            body: JSON.stringify({
              customer_id,
              event_ids,
              fee_usd: feeUsd,
              savings_usd: totalSavings,
              billed_at: new Date().toISOString(),
            }),
          })

          results.push({ customer_id, action: 'billed', savings_usd: totalSavings, fee_usd: feeUsd })
          billedCount++
        }
      } catch (customerErr: unknown) {
        console.error(`[billing/month-end] Error for customer ${customer_id}:`, customerErr)
        results.push({ customer_id, action: 'error', error: (customerErr as Error).message })
      }
    }

    return NextResponse.json({
      ok: true,
      billed: billedCount,
      rolledOver: rolledOverCount,
      results,
    })
  } catch (err: unknown) {
    console.error('[billing/month-end]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
