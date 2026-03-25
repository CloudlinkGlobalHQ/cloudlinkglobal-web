'use client'

import { useSubscription } from '../SubscriptionProvider'
import Link from 'next/link'

export default function UpgradeGate({ feature, requiredPlan = 'starter', children }: {
  feature: string
  requiredPlan?: 'starter' | 'growth' | 'enterprise'
  children: React.ReactNode
}) {
  const { plan, subscription, loading } = useSubscription()

  if (loading) return null

  const planRank: Record<string, number> = { free: 0, starter: 1, growth: 2, enterprise: 3 }
  const status = subscription?.status || 'none'
  const effectivePlan = status === 'active' || plan === 'enterprise' ? plan : 'free'
  const userRank = planRank[effectivePlan] ?? 0
  const requiredRank = planRank[requiredPlan] ?? 1

  if (userRank >= requiredRank) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature} requires {requiredPlan}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
        Upgrade to the {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan to unlock {feature.toLowerCase()}.
      </p>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        View plans →
      </Link>
    </div>
  )
}
