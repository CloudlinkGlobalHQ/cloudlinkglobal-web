'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export default function PostHogProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY) return
    let cancelled = false

    const load = async () => {
      const { default: posthog } = await import('posthog-js')
      if (cancelled) return
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
      })
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => {
        void load()
      })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!POSTHOG_KEY) return
    let cancelled = false

    const capture = async () => {
      const { default: posthog } = await import('posthog-js')
      if (cancelled) return
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      posthog.capture('$pageview', { $current_url: url })
    }

    void capture()

    return () => {
      cancelled = true
    }
  }, [pathname, searchParams])

  return null
}
