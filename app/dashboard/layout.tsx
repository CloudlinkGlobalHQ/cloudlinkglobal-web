'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { getStats, scanNow } from '../lib/api'
import ClerkApiProvider from '../components/ClerkApiProvider'
import { SubscriptionProvider, useSubscription } from '../components/SubscriptionProvider'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cl-dash-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#cl-dash-bg)" />
      <circle cx="12" cy="21" r="3.5" fill="white" />
      <circle cx="28" cy="21" r="3.5" fill="white" />
      <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 21 C10 11, 30 11, 30 21" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const NAV = [
  { label: 'Overview',       href: '/dashboard' },
  { label: 'AI Advisor',     href: '/dashboard/advisor' },
  { label: 'Forecast',       href: '/dashboard/forecast' },
  { label: 'Unit Economics', href: '/dashboard/unit-economics' },
  { label: 'Tag Costs',      href: '/dashboard/tags' },
  { label: 'Virtual Tags',   href: '/dashboard/virtual-tags' },
  { label: 'Kubernetes',     href: '/dashboard/kubernetes' },
  { label: 'AutoStop',       href: '/dashboard/autostop' },
  { label: 'Reserved',       href: '/dashboard/reserved-instances' },
  { label: 'Rightsizing',    href: '/dashboard/rightsizing' },
  { label: 'Savings Report', href: '/dashboard/savings-report' },
  { label: 'Regressions',    href: '/dashboard/regressions' },
  { label: 'Estimate',       href: '/dashboard/cost-estimate' },
  { label: 'Deploys',        href: '/dashboard/deploys' },
  { label: 'Actions',        href: '/dashboard/actions' },
  { label: 'Resources',      href: '/dashboard/resources' },
  { label: 'Credentials',    href: '/dashboard/credentials' },
  { label: 'Runs',           href: '/dashboard/runs' },
  { label: 'Scans',          href: '/dashboard/scans' },
  { label: 'Audit',          href: '/dashboard/audit' },
  { label: 'Webhooks',       href: '/dashboard/webhooks' },
  { label: 'Budgets',        href: '/dashboard/budgets' },
  { label: 'Team',           href: '/dashboard/team' },
  { label: 'API Keys',       href: '/dashboard/api-keys' },
  { label: 'Billing',        href: '/dashboard/billing' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [stats, setStats]     = useState<any>(null)
  const [scanState, setScanState] = useState<'idle'|'scanning'|'running'|'done'|'error'>('idle')
  const [scanMsg, setScanMsg] = useState('')

  const refreshStats = useCallback(async () => {
    try { setStats(await getStats()) } catch {}
  }, [])

  useEffect(() => {
    refreshStats()
    const t = setInterval(refreshStats, 15000)
    return () => clearInterval(t)
  }, [refreshStats])

  const handleRunScan = async () => {
    setScanState('scanning'); setScanMsg('Scanning cloud accounts…')
    try {
      const res = await scanNow()
      const found = res.total_events_found ?? 0
      setScanMsg(`Scan done — ${found} resource${found !== 1 ? 's' : ''} found`)
      setScanState('done')
      refreshStats()
    } catch (e: any) {
      setScanMsg(`Error: ${e.message}`)
      setScanState('error')
    }
    setTimeout(() => { setScanState('idle'); setScanMsg('') }, 5000)
  }

  const scanLabel = { idle: '▶ Run scan', scanning: '⟳ Scanning…', running: '⟳ Running…', done: '✓ Done', error: '✕ Error' }[scanState]

  return (
    <ClerkApiProvider>
    <SubscriptionProvider>
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size={28} />
            <span className="font-bold text-gray-900 text-base tracking-tight">Cloudlink</span>
          </Link>
          {stats && <span className="text-xs text-slate-400 hidden sm:block">Tenant: {stats.tenant_id?.slice(0,8)}…</span>}
        </div>
        <div className="flex items-center gap-3">
          {scanMsg && (
            <span className={`text-xs font-medium hidden sm:block ${scanState === 'error' ? 'text-red-500' : scanState === 'done' ? 'text-green-600' : 'text-slate-500'}`}>
              {scanMsg}
            </span>
          )}
          <button onClick={handleRunScan} disabled={scanState === 'scanning' || scanState === 'running'}
            className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 shadow-sm ${
              scanState === 'done' ? 'bg-green-600' : scanState === 'error' ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'
            }`}>
            {scanLabel}
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1 overflow-x-auto max-w-7xl mx-auto">
          {NAV.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  active ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}>
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
    </SubscriptionProvider>
    </ClerkApiProvider>
  )
}
