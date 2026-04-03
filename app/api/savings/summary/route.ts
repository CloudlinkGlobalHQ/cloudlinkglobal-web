import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.CLOUDLINK_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

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

    const savingsMtd = toNumber(data?.savings_this_month_usd)
    const savingsAllTime = toNumber(data?.savings_all_time_usd)
    const rollover = toNumber(data?.rollover_usd)
    const threshold = toNumber(data?.billing_threshold_usd) || 500

    return NextResponse.json({
      ...data,
      savings_this_month_usd: savingsMtd,
      savings_all_time_usd: savingsAllTime,
      rollover_usd: rollover,
      cloudlink_fee_this_month_usd: toNumber(data?.cloudlink_fee_this_month_usd) || savingsMtd * 0.15,
      cloudlink_fee_all_time_usd: toNumber(data?.cloudlink_fee_all_time_usd) || savingsAllTime * 0.15,
      breakdown: typeof data?.breakdown === 'object' && data?.breakdown ? data.breakdown : {
        AUTOSTOP: 0,
        IDLE_RESOURCE: 0,
        REGRESSION_PREVENTION: 0,
        MISCONFIGURATION_FIX: 0,
      },
      events: Array.isArray(data?.events) ? data.events : [],
      billing_threshold_usd: threshold,
      pending_billing: savingsMtd >= threshold,
    })
  } catch (err: unknown) {
    console.error('[savings/summary]', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
