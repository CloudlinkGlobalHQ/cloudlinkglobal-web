import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

// GET /api/savings/summary
// Returns real-time savings summary for the dashboard widget:
// {
//   savings_this_month_usd: number,
//   cloudlink_fee_this_month_usd: number,  // 15% of savings
//   savings_all_time_usd: number,
//   cloudlink_fee_all_time_usd: number,
//   breakdown: { AUTOSTOP: number, IDLE_RESOURCE: number, REGRESSION_PREVENTION: number, MISCONFIGURATION_FIX: number },
//   rollover_usd: number,                  // savings rolled from prior months
//   billing_threshold_usd: number,         // always 500
//   pending_billing: boolean,              // true if current savings >= $500
//   events: SavingsEvent[],
// }
export async function GET() {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = await getToken()
    const res = await fetch(`${API_URL}/savings/summary/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })

    if (!res.ok) {
      // Backend not yet updated — return zero state so dashboard renders
      return NextResponse.json({
        savings_this_month_usd: 0,
        cloudlink_fee_this_month_usd: 0,
        savings_all_time_usd: 0,
        cloudlink_fee_all_time_usd: 0,
        breakdown: { AUTOSTOP: 0, IDLE_RESOURCE: 0, REGRESSION_PREVENTION: 0, MISCONFIGURATION_FIX: 0 },
        rollover_usd: 0,
        billing_threshold_usd: 500,
        pending_billing: false,
        events: [],
      })
    }

    const data = await res.json()

    // Compute fee client-side if backend doesn't return it
    const savingsMtd = data.savings_this_month_usd ?? 0
    const savingsAllTime = data.savings_all_time_usd ?? 0
    return NextResponse.json({
      ...data,
      cloudlink_fee_this_month_usd: data.cloudlink_fee_this_month_usd ?? savingsMtd * 0.15,
      cloudlink_fee_all_time_usd: data.cloudlink_fee_all_time_usd ?? savingsAllTime * 0.15,
      billing_threshold_usd: 500,
      pending_billing: savingsMtd >= 500,
    })
  } catch (err: any) {
    console.error('[savings/summary]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
