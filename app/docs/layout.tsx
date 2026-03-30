'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

// ── Navigation structure ──────────────────────────────────────────────────────

export type NavItem = {
  label: string
  id: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'What is Cloudlink?', id: 'what-is-cloudlink' },
      { label: 'How the pricing works', id: 'how-pricing-works' },
      { label: 'Quick start (5 minutes)', id: 'quick-start' },
      { label: 'System requirements', id: 'system-requirements' },
    ],
  },
  {
    title: 'Connecting Your Cloud',
    items: [
      { label: 'Connecting AWS', id: 'connecting-aws' },
      { label: 'Connecting Azure', id: 'connecting-azure' },
      { label: 'Connecting GCP', id: 'connecting-gcp' },
      { label: 'Managing connections', id: 'managing-connections' },
    ],
  },
  {
    title: 'Understanding Your Dashboard',
    items: [
      { label: 'Overview page', id: 'dashboard-overview' },
      { label: 'Reading the KPI cards', id: 'kpi-cards' },
      { label: 'Cost over time chart', id: 'cost-chart' },
      { label: 'Savings breakdown', id: 'savings-breakdown' },
      { label: 'Setting your date range', id: 'date-range' },
    ],
  },
  {
    title: 'Cost Regressions',
    items: [
      { label: 'What is a regression?', id: 'what-is-regression' },
      { label: 'How detection works', id: 'regression-detection' },
      { label: 'Reading a regression alert', id: 'regression-alerts' },
      { label: 'Approving and rejecting fixes', id: 'regression-fixes' },
      { label: 'Regression history', id: 'regression-history' },
    ],
  },
  {
    title: 'Resources & Scanning',
    items: [
      { label: 'What we scan for', id: 'what-we-scan' },
      { label: 'EC2 and compute', id: 'ec2-compute' },
      { label: 'EBS and storage', id: 'ebs-storage' },
      { label: 'Lambda functions', id: 'lambda-functions' },
      { label: 'RDS and databases', id: 'rds-databases' },
      { label: 'S3 buckets', id: 's3-buckets' },
      { label: 'AutoStopping', id: 'autostopping' },
    ],
  },
  {
    title: 'Savings & Billing',
    items: [
      { label: 'How savings are calculated', id: 'savings-calculation' },
      { label: 'What counts as a saving', id: 'what-counts' },
      { label: 'The 15% commission', id: 'commission' },
      { label: 'Monthly invoices', id: 'invoices' },
      { label: 'The $500 minimum threshold', id: 'minimum-threshold' },
      { label: 'Disputing a charge', id: 'disputes' },
    ],
  },
  {
    title: 'SDK Reference',
    items: [
      { label: 'Installation', id: 'sdk-installation' },
      { label: 'Quick start', id: 'sdk-quickstart' },
      { label: 'Tracking unit costs', id: 'sdk-tracking' },
      { label: 'FastAPI middleware', id: 'sdk-fastapi' },
      { label: 'Django middleware', id: 'sdk-django' },
      { label: 'Configuration options', id: 'sdk-config' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Authentication', id: 'api-auth' },
      { label: 'Base URL and versioning', id: 'api-base-url' },
      { label: 'Rate limits', id: 'api-rate-limits' },
      { label: 'Endpoints — Dashboard', id: 'api-dashboard' },
      { label: 'Endpoints — Regressions', id: 'api-regressions' },
      { label: 'Endpoints — Resources', id: 'api-resources' },
      { label: 'Endpoints — Savings', id: 'api-savings' },
      { label: 'Error codes', id: 'api-errors' },
    ],
  },
  {
    title: 'MCP Server',
    items: [
      { label: 'What is the MCP server?', id: 'mcp-overview' },
      { label: 'Connecting to Claude', id: 'mcp-claude' },
      { label: 'Connecting to Cursor', id: 'mcp-cursor' },
      { label: 'Available tools', id: 'mcp-tools' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { label: 'Slack alerts', id: 'slack-alerts' },
      { label: 'GitHub PR comments', id: 'github-integration' },
      { label: 'Email notifications', id: 'email-notifications' },
      { label: 'Webhooks', id: 'webhooks' },
    ],
  },
]

// ── Sidebar component ─────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CloudlinkLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="cl-docs-logo" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#cl-docs-logo)" />
      <circle cx="12" cy="21" r="3.5" fill="white" />
      <circle cx="28" cy="21" r="3.5" fill="white" />
      <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Sidebar({ activeId, onClose }: { activeId: string; onClose?: () => void }) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const isDocsRoot = pathname === '/docs' || pathname === '/docs/'

  const filtered: NavSection[] = search.trim()
    ? NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((section) => section.items.length > 0)
    : NAV_SECTIONS

  return (
    <aside style={{
      width: '256px', minWidth: '256px', backgroundColor: '#0F1629',
      borderRight: '1px solid #1E2D4F', display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1E2D4F', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <CloudlinkLogo />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F1F5F9', letterSpacing: '-0.01em' }}>
            Cloudlink Docs
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} aria-label="Close sidebar">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0A0E1A', border: '1px solid #1E2D4F', borderRadius: '8px', padding: '8px 12px' }}>
          <span style={{ color: '#475569', flexShrink: 0 }}><SearchIcon /></span>
          <input
            type="text" placeholder="Search docs..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: '#F1F5F9', fontFamily: 'Inter, sans-serif', fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {filtered.map((section) => (
          <div key={section.title} style={{ marginBottom: '4px' }}>
            <div style={{ padding: '10px 16px 4px', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase' as const }}>
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = isDocsRoot && activeId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={onClose}
                  style={{
                    display: 'block', padding: '6px 16px 6px 14px',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#10B981' : '#94A3B8',
                    textDecoration: 'none',
                    borderLeft: isActive ? '2px solid #10B981' : '2px solid transparent',
                    transition: 'color 0.15s, border-color 0.15s',
                    backgroundColor: isActive ? 'rgba(16,185,129,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.color = '#F1F5F9' } }}
                  onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8' } }}
                >
                  {item.label}
                </a>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #1E2D4F', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#475569' }}>
        <Link href="/" style={{ color: '#10B981', textDecoration: 'none' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')}>
          ← Back to Cloudlink
        </Link>
      </div>
    </aside>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState('')

  // Flatten all section IDs for IntersectionObserver
  const allIds = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.id))
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect()

    const headings = allIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (headings.length === 0) return

    // Track which sections are visible and pick the topmost one
    const visibleSections = new Set<string>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id)
          } else {
            visibleSections.delete(entry.target.id)
          }
        })
        // Set active to topmost visible section
        for (const id of allIds) {
          if (visibleSections.has(id)) {
            setActiveId(id)
            break
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    headings.forEach((el) => observerRef.current!.observe(el))

    return () => observerRef.current?.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="docs-sidebar-desktop">
        <Sidebar activeId={activeId} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 50 }}>
            <Sidebar activeId={activeId} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile header */}
        <div className="docs-mobile-header" style={{ display: 'none', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: '#0F1629', borderBottom: '1px solid #1E2D4F', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <CloudlinkLogo />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#F1F5F9' }}>Cloudlink Docs</span>
          </Link>
        </div>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '48px 40px' }} className="docs-main-content">
          <div style={{ maxWidth: '740px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .docs-sidebar-desktop { display: none !important; }
          .docs-mobile-header { display: flex !important; }
          .docs-main-content { padding: 24px 20px !important; }
        }
        @media (min-width: 769px) {
          .docs-mobile-header { display: none !important; }
          .docs-sidebar-desktop { display: block !important; }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
