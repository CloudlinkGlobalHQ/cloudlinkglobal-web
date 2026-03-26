import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  growth: process.env.STRIPE_GROWTH_PRICE_ID || '',
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    const priceId = PRICES[plan]
    if (!priceId) {
      const configured = Object.entries(PRICES).filter(([, v]) => v).map(([k]) => k)
      console.error(`[stripe/checkout] Missing price ID for plan "${plan}". Set STRIPE_${plan.toUpperCase()}_PRICE_ID in Vercel env vars. Configured plans: ${configured.join(', ') || 'none'}`)
      return NextResponse.json({
        error: `Billing is not fully configured yet. Please contact support to upgrade your plan.`,
      }, { status: 503 })
    }

    const origin = req.headers.get('origin') || 'https://cloudlinkglobal.com'

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/#pricing`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      metadata: { clerk_user_id: userId, plan },
      subscription_data: {
        metadata: { clerk_user_id: userId, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
