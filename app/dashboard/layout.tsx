/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  LayoutDashboard, LineChart, AlertTriangle, Server, PowerOff, Sparkles,
  Shield, Sliders, Tag, TrendingDown, BarChart2, GitBranch, Search,
  ClipboardList, Webhook, Users, Key, CreditCard, Settings, Lock,
  Zap, Bell, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react'
import { getStats, scanNow } from '../lib/api'
import ClerkApiProvider from '../components/ClerkApiProvider'
import { SubscriptionProvider } from '../components/SubscriptionProvider'

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    title: '',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MONITOR',
    items: [
      { label: 'Cost Explorer', href: '/dashboard/cost-explorer', icon: LineChart },
      { label: 'Regressions',   href: '/dashboard/regressions',   icon: AlertTriangle },
      { label: 'Resources',     href: '/dashboard/resources',      icon: Server },
      { label: 'AutoStopping',  href: '/dashboard/autostop',       icon: PowerOff },
      { label: 'AI Advisor',    href: '/dashboard/advisor',        icon: Sparkles },
    ],
  },
  {
    title: 'OPTIMIZE',
    items: [
      { label: 'Budgets',            href: '/dashboard/budgets',            icon: Shield },
      { label: 'Rightsizing',        href: '/dashboard/rightsizing',        icon: Sliders },
      { label: 'Reserved Instances', href: '/dashboard/reserved-instances', icon: Tag },
      { label: 'Savings Plans',      href: '/dashboard/savings-plans',      icon: TrendingDown },
      { label: 'Unit Economics',     href: '/dashboard/unit-economics',     icon: BarChart2 },
    ],
  },
  {
    title: 'OPERATE',
    items: [
      { label: 'Deploys',   href: '/dashboard/deploys',   icon: GitBranch },
      { label: 'Scans',     href: '/dashboard/scans',     icon: Search },
      { label: 'Audit',     href: '/dashboard/audit',     icon: ClipboardList },
      { label: 'Webhooks',  href: '/dashboard/webhooks',  icon: Webhook },
      { label: 'Team',      href: '/dashboard/team',      icon: Users },
      { label: 'API Keys',  href: '/dashboard/api-keys',  icon: Key },
      { label: 'Billing',   href: '/dashboard/billing',   icon: CreditCard },
      { label: 'Settings',  href: '/dashboard/settings',  icon: Settings },
      { label: 'Credentials', href: '/dashboard/credentials', icon: Lock },
    ],
  },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ─── Sidebar NavItem ──────────────────────────────────────────────────────────

function NavItem({
  href, label, icon: Icon, pathname, collapsed, onClick,
}: {
  href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>
  pathname: string; collapsed: boolean; onClick?: () => void
}) {
  const active = isActivePath(pathname, href)
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 relative group',
        collapsed ? 'justify-center px-2' : '',
        active
          ? 'bg-[#10B981]/10 text-[#10B981] border-l-2 border-[#10B981]'
          : 'text-[#94A3B8] hover:bg-[#1E2D4F]/60 hover:text-[#CBD5E1] border-l-2 border-transparent',
      ].join(' ')}
    >
      <Icon size={16} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <span className="absolute left-14 z-50 hidden group-hover:flex bg-[#1E2D4F] text-[#F1F5F9] text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-[#2E3D5F]">
          {label}
        </span>
      )}
    </Link>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  collapsed, pathname, onClose,
}: {
  collapsed: boolean; pathname: string; onClose?: () => void
}) {
  return (
    <div className={[
      'flex flex-col h-full bg-[#0F1629] border-r border-[#1E2D4F] transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    ].join(' ')}>
      {/* Logo */}
      <div className={[
        'flex items-center gap-2.5 h-14 px-4 border-b border-[#1E2D4F] flex-shrink-0',
        collapsed ? 'justify-center px-2' : '',
      ].join(' ')}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#10B981] flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[#F1F5F9] text-base tracking-tight">Cloudlink</span>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-[#64748B] hover:text-[#94A3B8] lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            {section.title && !collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-wider text-[#3D5070] uppercase select-none">
                {section.title}
              </p>
            )}
            {section.title && collapsed && <div className="my-2 border-t border-[#1E2D4F]/60" />}
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                pathname={pathname}
                collapsed={collapsed}
                onClick={onClose}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={[
        'border-t border-[#1E2D4F] p-3 flex-shrink-0',
        collapsed ? 'flex justify-center items-center' : 'flex items-center gap-2.5',
      ].join(' ')}>
        <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
        {!collapsed && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E2D4F] text-[#64748B] border border-[#2E3D5F]">
            Free Plan
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main layout ──────────────────────────────────────────────────────────────

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_stats, setStats] = useState<any>(null)
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [scanMsg, setScanMsg] = useState('')
  const [activeCloud, setActiveCloud] = useState<'AWS' | 'Azure' | 'GCP'>('AWS')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [globalSearch, setGlobalSearch] = useState('')

  const refreshStats = useCallback(async () => {
    try { setStats(await getStats()) } catch {}
  }, [])

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStats()
    const t = setInterval(refreshStats, 15000)
    return () => clearInterval(t)
  }, [refreshStats])

  useEffect(() => {
    const cloud = (searchParams.get('cloud') || '').toLowerCase()
    const range = searchParams.get('range')
    const q = searchParams.get('q') || ''

    if (cloud === 'azure') setActiveCloud('Azure')
    else if (cloud === 'gcp') setActiveCloud('GCP')
    else setActiveCloud('AWS')

    if (range === '7d' || range === '30d' || range === '90d') {
      setDateRange(range)
    } else {
      setDateRange('30d')
    }

    setGlobalSearch(q)
  }, [searchParams])

  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key)
      else params.set(key, value)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const handleRunScan = async () => {
    setScanState('scanning'); setScanMsg('Scanning...')
    try {
      const res = await scanNow() as { total_events_found?: number }
      const found = res.total_events_found ?? 0
      setScanMsg(`${found} resource${found !== 1 ? 's' : ''} found`)
      setScanState('done')
      refreshStats()
    } catch (e: any) {
      setScanMsg(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setScanState('error')
    }
    setTimeout(() => { setScanState('idle'); setScanMsg('') }, 5000)
  }

  const handleGlobalSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (globalSearch.trim()) params.set('q', globalSearch.trim())
    params.set('cloud', activeCloud.toLowerCase())
    router.push(`/dashboard/resources${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <ClerkApiProvider>
    <SubscriptionProvider>
    <div className="dashboard-shell min-h-screen flex" style={{ backgroundColor: '#0A0E1A', color: '#F1F5F9' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={[
        'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <Sidebar collapsed={false} pathname={pathname} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 sticky top-0 h-screen">
        <Sidebar collapsed={collapsed} pathname={pathname} />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 border-b"
          style={{
            height: 56,
            backgroundColor: '#0F1629',
            borderColor: '#1E2D4F',
          }}
        >
          {/* Left: mobile hamburger + collapse toggle + cloud tabs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[#64748B] hover:text-[#94A3B8] p-1.5 rounded-md hover:bg-[#1E2D4F]/60"
            >
              <Menu size={18} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E2D4F]/60 transition"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Cloud provider tabs */}
            <div className="hidden sm:flex items-center gap-0.5 bg-[#0A0E1A] rounded-lg p-0.5 border border-[#1E2D4F]">
              {(['AWS', 'Azure', 'GCP'] as const).map((cloud) => (
                <button
                  key={cloud}
                  onClick={() => updateQuery({ cloud: cloud.toLowerCase() })}
                  aria-label={`Filter dashboard for ${cloud}`}
                  className={[
                    'px-3 py-1 text-xs font-semibold rounded-md transition',
                    activeCloud === cloud
                      ? 'bg-[#10B981] text-white shadow'
                      : 'text-[#64748B] hover:text-[#94A3B8]',
                  ].join(' ')}
                >
                  {cloud}
                </button>
              ))}
            </div>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-lg mx-auto">
            <form className="relative" onSubmit={handleGlobalSearch}>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5070]" />
              <input
                type="text"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search resources, services, deploys..."
                aria-label="Search resources, services, and deploys"
                className="w-full bg-[#0A0E1A] border border-[#1E2D4F] rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#94A3B8] placeholder-[#3D5070] focus:outline-none focus:border-[#10B981]/50 transition"
              />
            </form>
          </div>

          {/* Right: date range, bell, scan, user */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Date range */}
            <div className="hidden sm:flex items-center gap-0.5 bg-[#0A0E1A] rounded-lg p-0.5 border border-[#1E2D4F]">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => updateQuery({ range })}
                  aria-label={`Set dashboard date range to ${range}`}
                  className={[
                    'px-2.5 py-1 text-xs font-medium rounded-md transition',
                    dateRange === range
                      ? 'bg-[#1E2D4F] text-[#F1F5F9]'
                      : 'text-[#64748B] hover:text-[#94A3B8]',
                  ].join(' ')}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Bell */}
            <Link
              href="/dashboard/audit"
              aria-label="Open activity and notifications"
              className="relative p-1.5 text-[#64748B] hover:text-[#94A3B8] rounded-md hover:bg-[#1E2D4F]/60 transition"
            >
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#F59E0B] rounded-full border border-[#0F1629]" />
            </Link>

            {/* Scan button */}
            {scanMsg && (
              <span className={`text-xs hidden md:block ${scanState === 'error' ? 'text-red-400' : scanState === 'done' ? 'text-green-400' : 'text-[#64748B]'}`}>
                {scanMsg}
              </span>
            )}
            <button
              onClick={handleRunScan}
              disabled={scanState === 'scanning'}
              className={[
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60',
                scanState === 'done'  ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : scanState === 'error' ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/20',
              ].join(' ')}
            >
              {scanState === 'scanning' ? 'Scanning...' : scanState === 'done' ? 'Done' : scanState === 'error' ? 'Retry' : 'Run Scan'}
            </button>

            {/* User */}
            <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: '#0A0E1A' }}>
          {children}
        </main>
      </div>
    </div>
    </SubscriptionProvider>
    </ClerkApiProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E1A]" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}
