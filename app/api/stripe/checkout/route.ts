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
    if (!priceId) return NextResponse.json({ error: `Invalid plan or missing price ID for: ${plan}` }, { status: 400 })

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
