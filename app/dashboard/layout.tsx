'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  LayoutDashboard, LineChart, AlertTriangle, Server, Sparkles,
  Shield, Sliders, Tag, GitBranch, Search, ClipboardList,
  Webhook, Users, CreditCard, Settings, Lock,
  ChevronLeft, ChevronRight, Menu, X, Loader2,
} from 'lucide-react'
import ClerkApiProvider from '../components/ClerkApiProvider'
import { SubscriptionProvider, useSubscription } from '../components/SubscriptionProvider'
import { useScan } from '../lib/scan'

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavEntry = { label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; soon?: boolean }

const NAV_SECTIONS: { title: string; items: NavEntry[] }[] = [
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
      { label: 'Resources',     href: '/dashboard/resources',     icon: Server },
      { label: 'Scans',         href: '/dashboard/scans',         icon: Search },
      { label: 'AI Advisor',    href: '/dashboard/advisor',       icon: Sparkles },
    ],
  },
  {
    title: 'OPTIMIZE',
    items: [
      { label: 'Rightsizing',        href: '/dashboard/rightsizing',        icon: Sliders },
      { label: 'Reserved Instances', href: '/dashboard/reserved-instances', icon: Tag },
    ],
  },
  {
    title: 'COMING SOON',
    items: [
      { label: 'Regressions',  href: '/dashboard/regressions', icon: AlertTriangle, soon: true },
      { label: 'Budgets',      href: '/dashboard/budgets',     icon: Shield,        soon: true },
      { label: 'Deploys',      href: '/dashboard/deploys',     icon: GitBranch,     soon: true },
      { label: 'Activity Log', href: '/dashboard/audit',       icon: ClipboardList, soon: true },
      { label: 'Team',         href: '/dashboard/team',        icon: Users,         soon: true },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Credentials', href: '/dashboard/credentials', icon: Lock },
      { label: 'Webhooks',    href: '/dashboard/webhooks',    icon: Webhook },
      { label: 'Billing',     href: '/dashboard/billing',     icon: CreditCard },
      { label: 'Settings',    href: '/dashboard/settings',    icon: Settings },
    ],
  },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ─── Sidebar NavItem ──────────────────────────────────────────────────────────

function NavItem({
  item, pathname, collapsed, onClick,
}: {
  item: NavEntry; pathname: string; collapsed: boolean; onClick?: () => void
}) {
  const { href, label, icon: Icon, soon } = item
  const active = isActivePath(pathname, href)
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? (soon ? `${label} (coming soon)` : label) : undefined}
      aria-label={collapsed ? (soon ? `${label} (coming soon)` : label) : undefined}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 relative group',
        collapsed ? 'justify-center px-2' : '',
        active
          ? 'bg-[#10B981]/10 text-[#10B981] border-l-2 border-[#10B981]'
          : 'text-[#94A3B8] hover:bg-[#1E2D4F]/60 hover:text-[#CBD5E1] border-l-2 border-transparent',
      ].join(' ')}
    >
      <Icon size={16} className="flex-shrink-0" />
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && soon && (
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Soon</span>
      )}
      {collapsed && (
        <span className="absolute left-14 z-50 hidden group-hover:flex bg-[#1E2D4F] text-[#F1F5F9] text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-[#2E3D5F]">
          {label}{soon ? ' · soon' : ''}
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
  const { isPaid, plan } = useSubscription()
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
        <Link href="/dashboard" aria-label="Cloudlink dashboard home" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" width={20} height={11} className="h-auto w-[20px]" />
          </span>
          {!collapsed && (
            <span className="font-bold text-[#F1F5F9] text-base tracking-tight">Cloudlink</span>
          )}
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Close navigation menu" className="ml-auto text-[#64748B] hover:text-[#94A3B8] lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
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
                item={item}
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
          <Link
            href="/pilot"
            className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#6EE7B7] border border-[#10B981]/30"
            title={isPaid ? `${plan} plan` : 'The fall 2026 pilot is free and read-only'}
          >
            {isPaid ? `${plan[0].toUpperCase()}${plan.slice(1)} plan` : 'Free pilot'}
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Run scan ─────────────────────────────────────────────────────────────────

function RunScanButton() {
  const scan = useScan()
  const running = scan.status === 'running'
  return (
    <button
      type="button"
      onClick={() => { void scan.start() }}
      disabled={running}
      aria-busy={running}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-lg transition bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/20 disabled:cursor-wait disabled:opacity-70"
    >
      {running && <Loader2 size={12} className="animate-spin" aria-hidden />}
      {running ? 'Scanning…' : 'Run scan'}
    </button>
  )
}

function ScanStatusBar() {
  const scan = useScan()
  if (scan.status === 'idle') return null
  const tone =
    scan.status === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200'
    : scan.status === 'needs_credentials' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
    : scan.status === 'running' ? 'border-[#1E2D4F] bg-[#141C33] text-[#CBD5E1]'
    : 'border-[#10B981]/30 bg-[#10B981]/10 text-[#A7F3D0]'
  return (
    <div role="status" aria-live="polite" data-testid="scan-status" className={`mx-4 mt-3 md:mx-6 rounded-lg border px-3 py-2 text-xs ${tone}`}>
      {scan.message}
      {scan.status === 'needs_credentials' && (
        <Link href="/dashboard/credentials" className="ml-2 font-semibold underline">Connect AWS</Link>
      )}
      {(scan.status === 'success' || scan.status === 'queued') && (
        <Link href="/dashboard/scans" className="ml-2 font-semibold underline">View scans</Link>
      )}
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
  const [globalSearch, setGlobalSearch] = useState('')

  const q = searchParams.get('q') || ''
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setGlobalSearch(q) }, [q])

  const handleGlobalSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = globalSearch.trim()
    router.push(`/dashboard/resources${term ? `?q=${encodeURIComponent(term)}` : ''}`)
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
        mobileOpen ? 'translate-x-0' : '-translate-x-full invisible',
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
          className="sticky top-0 z-30 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b"
          style={{
            height: 56,
            backgroundColor: '#0F1629',
            borderColor: '#1E2D4F',
          }}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden text-[#64748B] hover:text-[#94A3B8] p-1.5 rounded-md hover:bg-[#1E2D4F]/60"
            >
              <Menu size={18} />
            </button>

            <button
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E2D4F]/60 transition"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <span className="hidden sm:inline-flex rounded-md border border-[#1E2D4F] bg-[#0A0E1A] px-2 py-1 text-xs font-semibold text-[#94A3B8]">
              AWS
            </span>
          </div>

          {/* Search (filters the Resources page) */}
          <div className="flex-1 min-w-0 max-w-lg mx-auto">
            <form className="relative" onSubmit={handleGlobalSearch} role="search">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5070]" aria-hidden />
              <input
                type="search"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search resources…"
                aria-label="Search scanned resources"
                className="w-full bg-[#0A0E1A] border border-[#1E2D4F] rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#94A3B8] placeholder-[#3D5070] focus:outline-none focus:border-[#10B981]/50 transition"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <RunScanButton />
            <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
          </div>
        </header>

        <ScanStatusBar />

        {/* Page content */}
        <main className="flex-1 min-w-0 overflow-x-auto p-4 md:p-6" style={{ backgroundColor: '#0A0E1A' }}>
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
