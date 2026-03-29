import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '../../../lib/stripe'

interface StripeSubscriptionExpanded extends Stripe.Subscription {
  current_period_end: number
}

type StripeInvoice = Omit<Stripe.Invoice, 'subscription'> & {
  subscription: string | null
}

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const BACKEND_SYNC_SECRET =
  process.env.CLOUDLINK_WEBHOOK_SECRET ||
  process.env.CLOUDLINK_SYNC_SECRET ||
  process.env.CLOUDLINK_SUPERADMIN_KEY ||
  ''

async function syncSubscription(data: {
  clerk_user_id: string
  stripe_customer_id: string
  stripe_subscription_id?: string
  plan: string
  status: string
  current_period_end?: string
}) {
  try {
    if (!BACKEND_SYNC_SECRET) {
      throw new Error('Missing Cloudlink backend sync secret')
    }
    await fetch(`${API_URL}/subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BACKEND_SYNC_SECRET}`,
      },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Failed to sync subscription to backend:', err)
  }
}

async function notifyBackend(path: string, body: object) {
  if (!BACKEND_SYNC_SECRET) return
  try {
    await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BACKEND_SYNC_SECRET}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error(`Failed to notify backend ${path}:`, err)
  }
}

function planFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth'
  if (priceId === process.env.STRIPE_METERED_PRICE_ID) return 'performance'
  return 'unknown'
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    console.error('Stripe webhook signature verification failed:', (err as Error).message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    // ── Checkout / Setup ────────────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkUserId = session.metadata?.clerk_user_id

      if (session.mode === 'setup') {
        // Customer saved a payment method — mark on file in backend
        if (clerkUserId) {
          await notifyBackend('/subscription/payment-method-saved', {
            clerk_user_id: clerkUserId,
            stripe_customer_id: session.customer,
            setup_intent: session.setup_intent,
          })
        }
        break
      }

      // mode === 'subscription' (legacy tiered plans, kept for backward compat)
      const plan = session.metadata?.plan || 'starter'
      const stripeCustomerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (clerkUserId) {
        let periodEnd: string | undefined
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = await getStripe().subscriptions.retrieve(subscriptionId) as any as StripeSubscriptionExpanded
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
      }
      break
    }

    // ── Subscription updates ─────────────────────────────────────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as StripeSubscriptionExpanded
      const customerId = sub.customer as string
      const priceId = sub.items?.data?.[0]?.price?.id || ''
      const plan = planFromPriceId(priceId)
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined
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
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as StripeSubscriptionExpanded
      const clerkUserId = sub.metadata?.clerk_user_id
      if (clerkUserId) {
        await syncSubscription({
          clerk_user_id: clerkUserId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan: 'free',
          status: 'cancelled',
        })
        // Flag account as having a payment issue / subscription removed
        await notifyBackend('/subscription/cancelled', {
          clerk_user_id: clerkUserId,
          stripe_subscription_id: sub.id,
          cancelled_at: new Date().toISOString(),
        })
      }
      break
    }

    // ── Invoice events ───────────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as StripeInvoice
      const customerId = invoice.customer as string
      const amountPaidCents = invoice.amount_paid as number
      const invoiceId = invoice.id as string

      // Look up clerk_user_id from the subscription metadata
      let clerkUserId: string | undefined
      if (invoice.subscription) {
        try {
          const sub = await getStripe().subscriptions.retrieve(invoice.subscription as string)
          clerkUserId = sub.metadata?.clerk_user_id
        } catch {}
      }

      if (clerkUserId) {
        await notifyBackend('/billing/invoice-paid', {
          clerk_user_id: clerkUserId,
          stripe_customer_id: customerId,
          stripe_invoice_id: invoiceId,
          amount_paid_usd: amountPaidCents / 100,
          invoice_pdf: invoice.invoice_pdf,
          paid_at: new Date().toISOString(),
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as StripeInvoice
      const subId = invoice.subscription
      if (subId && typeof subId === 'string') {
        try {
          const subscription = await getStripe().subscriptions.retrieve(subId)
          const clerkUserId = subscription.metadata?.clerk_user_id
          if (clerkUserId) {
            await syncSubscription({
              clerk_user_id: clerkUserId,
              stripe_customer_id: invoice.customer as string,
              plan: planFromPriceId(subscription.items?.data?.[0]?.price?.id || ''),
              status: 'past_due',
            })
            await notifyBackend('/billing/payment-failed', {
              clerk_user_id: clerkUserId,
              stripe_customer_id: invoice.customer,
              stripe_invoice_id: invoice.id,
              amount_due_usd: (invoice.amount_due || 0) / 100,
              failed_at: new Date().toISOString(),
            })
          }
        } catch {}
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
