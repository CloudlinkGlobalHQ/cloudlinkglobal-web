import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

export async function POST(req: Request) {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken()
  const subRes = await fetch(`${API_URL}/subscription/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  })
  if (!subRes.ok) return NextResponse.json({ error: 'Could not load subscription' }, { status: 502 })

  const subscription = await subRes.json()
  const customerId = subscription?.stripe_customer_id
  if (!customerId) return NextResponse.json({ error: 'No Stripe customer found for this user' }, { status: 400 })

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://cloudlinkglobal.com'

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
