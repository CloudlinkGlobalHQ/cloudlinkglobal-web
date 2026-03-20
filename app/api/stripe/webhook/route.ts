import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '../../../lib/stripe'

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
      const plan = session.metadata?.plan
      const stripeCustomerId = session.customer as string
      const subscriptionId = session.subscription as string
      console.log(`Checkout completed: user=${clerkUserId}, plan=${plan}, customer=${stripeCustomerId}, sub=${subscriptionId}`)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      console.log(`Subscription updated: ${sub.id}, status=${sub.status}`)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      console.log(`Subscription cancelled: ${sub.id}`)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.log(`Payment failed: customer=${invoice.customer}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
