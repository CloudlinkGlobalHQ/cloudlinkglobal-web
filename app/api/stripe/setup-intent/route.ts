import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

// Returns a Stripe Checkout session URL (setup mode) so the customer can save a card.
// We use the hosted Stripe page — no frontend Stripe.js required.
export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = await getToken()
    const subRes = await fetch(`${API_URL}/subscription/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    const sub = subRes.ok ? await subRes.json() : null
    const customerId = sub?.stripe_customer_id

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found — connect your AWS account first' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || 'https://cloudlinkglobal.com'

    const session = await getStripe().checkout.sessions.create({
      mode: 'setup',
      customer: customerId,
      payment_method_types: ['card'],
      success_url: `${origin}/dashboard/billing?setup=success`,
      cancel_url: `${origin}/dashboard/billing`,
      metadata: { clerk_user_id: userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[stripe/setup-intent]', err)
    return NextResponse.json({ error: err.message || 'Setup failed' }, { status: 500 })
  }
}
