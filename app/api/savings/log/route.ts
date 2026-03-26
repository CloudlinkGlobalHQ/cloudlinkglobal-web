import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const BACKEND_SYNC_SECRET =
  process.env.CLOUDLINK_WEBHOOK_SECRET ||
  process.env.CLOUDLINK_SYNC_SECRET ||
  process.env.CLOUDLINK_SUPERADMIN_KEY ||
  ''

// Saving types we track. Each maps to a billing line item description.
export type SavingType =
  | 'AUTOSTOP'          // hourly_rate × hours_stopped
  | 'IDLE_RESOURCE'     // monthly resource cost (EBS, EC2, Lambda, etc.)
  | 'REGRESSION_PREVENTION' // (actual_spend - baseline_spend) for flagged deploys
  | 'MISCONFIGURATION_FIX'  // estimated monthly cost delta before/after fix

export interface SavingsLogBody {
  resource_id: string
  saving_type: SavingType
  amount_saved_usd: number
  description: string
  before_cost?: number
  after_cost?: number
  evidence?: string // CloudWatch metric URL, deploy ID, etc.
}

// POST /api/savings/log
// Writes a verified savings event to the backend.
// Actual Stripe usage reporting happens at month-end via /api/billing/month-end
// (we accumulate savings and only bill when >= $500 threshold is met).
export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: SavingsLogBody = await req.json()

    const { resource_id, saving_type, amount_saved_usd, description, before_cost, after_cost, evidence } = body

    if (!resource_id || !saving_type || !amount_saved_usd || !description) {
      return NextResponse.json({ error: 'Missing required fields: resource_id, saving_type, amount_saved_usd, description' }, { status: 400 })
    }

    if (amount_saved_usd <= 0) {
      return NextResponse.json({ error: 'amount_saved_usd must be positive' }, { status: 400 })
    }

    // Write to backend savings_events table
    const token = await getToken()
    const backendRes = await fetch(`${API_URL}/savings/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BACKEND_SYNC_SECRET
          ? `Bearer ${BACKEND_SYNC_SECRET}`
          : token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        customer_id: userId,
        resource_id,
        saving_type,
        amount_saved_usd,
        description,
        before_cost,
        after_cost,
        evidence,
        timestamp: new Date().toISOString(),
        billed: false,
      }),
    })

    if (!backendRes.ok) {
      const errText = await backendRes.text()
      console.error('[savings/log] Backend error:', errText)
      return NextResponse.json({ error: 'Failed to write savings event to backend' }, { status: 502 })
    }

    const savedEvent = await backendRes.json()

    return NextResponse.json({ ok: true, event: savedEvent })
  } catch (err: any) {
    console.error('[savings/log]', err)
    return NextResponse.json({ error: err.message || 'Failed to log saving' }, { status: 500 })
  }
}
