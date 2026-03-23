'use client'

import { useState } from 'react'
import { useSubscription, getPlanLimits } from '../../components/SubscriptionProvider'

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
}

export default function BillingPage() {
  const { subscription, plan, isPaid, loading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

  const limits = getPlanLimits(plan)

  const openPortal = async () => {
    if (!subscription?.stripe_customer_id) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscription.stripe_customer_id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e: any) {
      alert(e.message || 'Could not open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="text-sm text-gray-500 mt-1">Manage your subscription and billing details</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Current plan */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Current plan</div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">{PLAN_NAMES[plan] || plan}</span>
            {isPaid && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
            )}
            {subscription?.status === 'past_due' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Past due
              </span>
            )}
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-gray-500 mb-4">
              Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}

          <div className="flex gap-3">
            {isPaid ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition disabled:opacity-60"
              >
                {portalLoading ? 'Opening…' : 'Manage subscription'}
              </button>
            ) : (
              <a
                href="/#pricing"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-semibold text-white transition"
              >
                Upgrade plan →
              </a>
            )}
          </div>
        </div>

        {/* Plan limits */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Plan limits</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AWS services</span>
              <span className="text-sm font-medium text-gray-900">
                {limits.services === Infinity ? 'Unlimited' : limits.services}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">History retention</span>
              <span className="text-sm font-medium text-gray-900">{limits.historyDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Team seats</span>
              <span className="text-sm font-medium text-gray-900">
                {limits.teamSeats === Infinity ? 'Unlimited' : limits.teamSeats}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
