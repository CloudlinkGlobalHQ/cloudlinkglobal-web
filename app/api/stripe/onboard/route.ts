import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const BACKEND_SYNC_SECRET =
  process.env.CLOUDLINK_WEBHOOK_SECRET ||
  process.env.CLOUDLINK_SYNC_SECRET ||
  process.env.CLOUDLINK_SUPERADMIN_KEY ||
  ''

// Called when a customer connects their first AWS account.
// Creates a Stripe Customer + metered subscription so we can bill 15% of savings.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const meteredPriceId = process.env.STRIPE_METERED_PRICE_ID
    if (!meteredPriceId) {
      return NextResponse.json({ error: 'Metered billing not configured' }, { status: 503 })
    }

    // Check if user already has a Stripe customer
    const token = await getToken()
    const subRes = await fetch(`${API_URL}/subscription/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    const existingSub = subRes.ok ? await subRes.json() : null

    if (existingSub?.stripe_customer_id) {
      return NextResponse.json({
        stripe_customer_id: existingSub.stripe_customer_id,
        stripe_subscription_id: existingSub.stripe_subscription_id,
        already_onboarded: true,
      })
    }

    // Pull user email from Clerk to attach to Stripe customer
    let email: string | undefined
    try {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      })
      if (clerkRes.ok) {
        const clerkUser = await clerkRes.json()
        email = clerkUser.email_addresses?.[0]?.email_address
      }
    } catch {}

    // 1. Create Stripe Customer
    const customer = await getStripe().customers.create({
      metadata: { clerk_user_id: userId },
      ...(email ? { email } : {}),
    })

    // 2. Create metered subscription (trial_end = far future so no charge until we bill)
    // Usage-based: we report savings at month end, Stripe invoices automatically.
    const subscription = await getStripe().subscriptions.create({
      customer: customer.id,
      items: [{ price: meteredPriceId }],
      metadata: { clerk_user_id: userId },
      // Billing anchor = start of next month so periods align to calendar months
      billing_cycle_anchor_config: { day_of_month: 1 },
    })

    const subscriptionItemId = subscription.items.data[0]?.id

    // 3. Sync to backend
    if (BACKEND_SYNC_SECRET) {
      await fetch(`${API_URL}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BACKEND_SYNC_SECRET}`,
        },
        body: JSON.stringify({
          clerk_user_id: userId,
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          stripe_subscription_item_id: subscriptionItemId,
          plan: 'performance',
          status: 'active',
          current_period_end: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
        }),
      })
    }

    return NextResponse.json({
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      stripe_subscription_item_id: subscriptionItemId,
    })
  } catch (err: unknown) {
    console.error('[stripe/onboard]', err)
    return NextResponse.json({ error: (err as Error).message || 'Onboarding failed' }, { status: 500 })
  }
}
