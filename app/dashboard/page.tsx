'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStats } from '../lib/api'
import Overview from '../components/dashboard/Overview'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

  const refreshStats = useCallback(async () => {
    try { setStats(await getStats()) } catch {}
  }, [])

  useEffect(() => {
    refreshStats()
    const t = setInterval(refreshStats, 15000)
    return () => clearInterval(t)
  }, [refreshStats])

  return <Overview stats={stats} onRefresh={refreshStats} />
}
