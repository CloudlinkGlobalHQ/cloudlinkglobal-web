'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { getStats, scanNow } from '../lib/api'
import ClerkApiProvider from '../components/ClerkApiProvider'
import { SubscriptionProvider } from '../components/SubscriptionProvider'

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

function SectionGlyph({ title }: { title: string }) {
  if (title === 'Monitor') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 10.5h2.2L5.8 6l2.3 4 1.6-2.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (title === 'Optimize') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 9.5 5 7l2 1.5L11.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 4h2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2.25" y="2.25" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.25" y="2.25" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.25" y="8.25" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.25" y="8.25" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

const NAV_SECTIONS = [
  {
    title: 'Monitor',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'AI Advisor', href: '/dashboard/advisor' },
      { label: 'Forecast', href: '/dashboard/forecast' },
      { label: 'Unit Economics', href: '/dashboard/unit-economics' },
      { label: 'Tag Costs', href: '/dashboard/tags' },
      { label: 'Virtual Tags', href: '/dashboard/virtual-tags' },
      { label: 'Savings Plans', href: '/dashboard/savings-plans' },
      { label: 'Kubernetes', href: '/dashboard/kubernetes' },
      { label: 'AutoStop', href: '/dashboard/autostop' },
      { label: 'TTL Destroy', href: '/dashboard/ttl' },
      { label: 'Drift', href: '/dashboard/drift' },
    ],
  },
  {
    title: 'Optimize',
    items: [
      { label: 'Reserved', href: '/dashboard/reserved-instances' },
      { label: 'Rightsizing', href: '/dashboard/rightsizing' },
      { label: 'Savings Report', href: '/dashboard/savings-report' },
      { label: 'Regressions', href: '/dashboard/regressions' },
      { label: 'Estimate', href: '/dashboard/cost-estimate' },
      { label: 'Deploys', href: '/dashboard/deploys' },
      { label: 'Actions', href: '/dashboard/actions' },
      { label: 'Resources', href: '/dashboard/resources' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { label: 'Credentials', href: '/dashboard/credentials' },
      { label: 'Runs', href: '/dashboard/runs' },
      { label: 'Scans', href: '/dashboard/scans' },
      { label: 'Audit', href: '/dashboard/audit' },
      { label: 'Webhooks', href: '/dashboard/webhooks' },
      { label: 'Budgets', href: '/dashboard/budgets' },
      { label: 'Team', href: '/dashboard/team' },
      { label: 'API Keys', href: '/dashboard/api-keys' },
      { label: 'API Docs', href: '/dashboard/api-docs' },
      { label: 'Billing', href: '/dashboard/billing' },
    ],
  },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  href,
  label,
  pathname,
  compact = false,
  onClick,
}: {
  href: string
  label: string
  pathname: string
  compact?: boolean
  onClick?: () => void
}) {
  const active = isActivePath(pathname, href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'rounded-xl border text-sm font-medium transition',
        compact ? 'px-3 py-2.5' : 'px-3.5 py-3',
        active
          ? 'border-green-200 bg-green-50 text-green-700 shadow-sm'
          : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [stats, setStats]     = useState<any>(null)
  const [scanState, setScanState] = useState<'idle'|'scanning'|'running'|'done'|'error'>('idle')
  const [scanMsg, setScanMsg] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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

  const scanLabel = { idle: 'Run scan', scanning: 'Scanning...', running: 'Running...', done: 'Complete', error: 'Retry scan' }[scanState]

  return (
    <ClerkApiProvider>
    <SubscriptionProvider>
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size={28} />
            <span className="font-bold text-gray-900 text-base tracking-tight">Cloudlink</span>
          </Link>
          {stats && <span className="text-xs text-slate-400 hidden sm:block">Tenant: {stats.tenant_id?.slice(0,8)}…</span>}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            Menu
          </button>
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
        </div>
      </header>

      {mobileNavOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="mx-auto max-w-[1600px] space-y-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {section.title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      pathname={pathname}
                      compact
                      onClick={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 md:px-6">
        <aside className="sticky top-[88px] hidden h-[calc(100vh-112px)] w-[320px] shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Workspace</div>
              <div className="mt-1 text-xs text-slate-500">All dashboards, operations, and controls in one place.</div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Current tenant</div>
                <div className="mt-2 text-sm font-medium text-slate-900">{stats?.tenant_id ? `${stats.tenant_id.slice(0, 12)}...` : 'Loading...'}</div>
                <div className="mt-1 text-xs text-slate-500">Navigate every product area without losing your analytics context.</div>
              </div>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {NAV_SECTIONS.map((section) => (
                <section key={section.title}>
                  <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <span className="text-slate-500"><SectionGlyph title={section.title} /></span>
                    {section.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => (
                      <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} compact />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
    </SubscriptionProvider>
    </ClerkApiProvider>
  )
}
