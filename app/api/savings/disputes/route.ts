import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'
const BACKEND_SYNC_SECRET =
  process.env.CLOUDLINK_WEBHOOK_SECRET ||
  process.env.CLOUDLINK_SYNC_SECRET ||
  process.env.CLOUDLINK_SUPERADMIN_KEY ||
  ''

// GET  /api/savings/disputes  — list all disputes for this customer
// POST /api/savings/disputes  — create a new dispute for a savings event

export async function GET() {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = await getToken()
    const res = await fetch(`${API_URL}/savings/disputes/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ disputes: [] })
    }

    return NextResponse.json(await res.json())
  } catch (err: any) {
    console.error('[savings/disputes GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { saving_event_id, reason } = await req.json()
    if (!saving_event_id || !reason) {
      return NextResponse.json({ error: 'saving_event_id and reason are required' }, { status: 400 })
    }

    const token = await getToken()
    const res = await fetch(`${API_URL}/savings/disputes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BACKEND_SYNC_SECRET
          ? `Bearer ${BACKEND_SYNC_SECRET}`
          : token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        saving_event_id,
        customer_id: userId,
        reason,
        status: 'open',
        created_at: new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to create dispute' }, { status: 502 })
    }

    return NextResponse.json(await res.json())
  } catch (err: any) {
    console.error('[savings/disputes POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
