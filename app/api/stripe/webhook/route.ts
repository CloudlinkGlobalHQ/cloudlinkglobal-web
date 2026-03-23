import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '../../../lib/stripe'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const WEBHOOK_SECRET = process.env.CLOUDLINK_WEBHOOK_SECRET || ''

async function syncSubscription(data: {
  clerk_user_id: string
  stripe_customer_id: string
  stripe_subscription_id?: string
  plan: string
  status: string
  current_period_end?: string
}) {
  try {
    await fetch(`${API_URL}/subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Failed to sync subscription to backend:', err)
  }
}

function planFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth'
  return 'unknown'
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkUserId = session.metadata?.clerk_user_id
      const plan = session.metadata?.plan || 'starter'
      const stripeCustomerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (clerkUserId) {
        // Fetch subscription to get period end
        let periodEnd: string | undefined
        try {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId) as any
          if (sub.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString()
          }
        } catch {}

        await syncSubscription({
          clerk_user_id: clerkUserId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: 'active',
          current_period_end: periodEnd,
        })
        console.log(`Subscription synced: user=${clerkUserId}, plan=${plan}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      const customerId = sub.customer as string
      const priceId = sub.items?.data?.[0]?.price?.id || ''
      const plan = planFromPriceId(priceId)
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined

      // Look up clerk_user_id from metadata or find by customer
      const clerkUserId = sub.metadata?.clerk_user_id
      if (clerkUserId) {
        await syncSubscription({
          clerk_user_id: clerkUserId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          plan,
          status: sub.status === 'active' ? 'active' : sub.status,
          current_period_end: periodEnd,
        })
      }
      console.log(`Subscription updated: ${sub.id}, status=${sub.status}, plan=${plan}`)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      const clerkUserId = sub.metadata?.clerk_user_id
      if (clerkUserId) {
        await syncSubscription({
          clerk_user_id: clerkUserId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan: 'free',
          status: 'cancelled',
        })
      }
      console.log(`Subscription cancelled: ${sub.id}`)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any
      const subId = invoice.subscription
      if (subId && typeof subId === 'string') {
        try {
          const subscription = await getStripe().subscriptions.retrieve(subId) as any
          const clerkUserId = subscription.metadata?.clerk_user_id
          if (clerkUserId) {
            await syncSubscription({
              clerk_user_id: clerkUserId,
              stripe_customer_id: invoice.customer as string,
              plan: planFromPriceId(subscription.items?.data?.[0]?.price?.id || ''),
              status: 'past_due',
            })
          }
        } catch {}
      }
      console.log(`Payment failed: customer=${invoice.customer}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
