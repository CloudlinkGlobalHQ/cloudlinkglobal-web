'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'

type Plan = 'free' | 'starter' | 'growth' | 'enterprise'
type SubStatus = 'none' | 'active' | 'past_due' | 'cancelled'

interface Subscription {
  plan: Plan
  status: SubStatus
  clerk_user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_end?: string
}

interface SubscriptionContextValue {
  subscription: Subscription | null
  loading: boolean
  isPaid: boolean
  plan: Plan
  limits: { services: number; historyDays: number; teamSeats: number }
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: null,
  loading: true,
  isPaid: false,
  plan: 'free',
  limits: { services: 3, historyDays: 7, teamSeats: 1 },
  refresh: async () => {},
})

export function useSubscription() {
  return useContext(SubscriptionContext)
}

const PLAN_LIMITS: Record<Plan, { services: number; historyDays: number; teamSeats: number }> = {
  free: { services: 3, historyDays: 7, teamSeats: 1 },
  starter: { services: 3, historyDays: 7, teamSeats: 1 },
  growth: { services: 20, historyDays: 90, teamSeats: 5 },
  enterprise: { services: Infinity, historyDays: 365, teamSeats: Infinity },
}

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setSubscription(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/subscription')
      const data = await res.json()
      setSubscription(data)
    } catch {
      setSubscription({ plan: 'free', status: 'none', clerk_user_id: '' })
    } finally {
      setLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  const plan = subscription?.plan || 'free'
  const isPaid = plan !== 'free' && subscription?.status === 'active'

  const limits = getPlanLimits(plan)

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, isPaid, plan, limits, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
