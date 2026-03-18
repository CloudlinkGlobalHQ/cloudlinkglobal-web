'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getKey, setKey, getStats, scanNow, runOnce } from '../lib/api'

const NAV = [
  { label: 'Overview',    href: '/dashboard' },
  { label: 'Actions',     href: '/dashboard/actions' },
  { label: 'Resources',   href: '/dashboard/resources' },
  { label: 'Credentials', href: '/dashboard/credentials' },
  { label: 'Runs',        href: '/dashboard/runs' },
  { label: 'Scans',       href: '/dashboard/scans' },
  { label: 'Audit',       href: '/dashboard/audit' },
  { label: 'Webhooks',    href: '/dashboard/webhooks' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]     = useState(false)
  const [stats, setStats]     = useState<any>(null)
  const [scanState, setScanState] = useState<'idle'|'scanning'|'running'|'done'|'error'>('idle')
  const [scanMsg, setScanMsg] = useState('')

  useEffect(() => {
    if (!getKey()) { router.replace('/login'); return }
    setReady(true)
  }, [])

  const refreshStats = useCallback(async () => {
    if (!getKey()) return
    try { setStats(await getStats()) } catch {}
  }, [])

  useEffect(() => {
    if (!ready) return
    refreshStats()
    const t = setInterval(refreshStats, 15000)
    return () => clearInterval(t)
  }, [ready, refreshStats])

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

  if (!ready) return null

  const scanLabel = { idle: '▶ Run scan', scanning: '⟳ Scanning…', running: '⟳ Running…', done: '✓ Done', error: '✕ Error' }[scanState]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-600/30">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Cloudlink</span>
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
              scanState === 'done' ? 'bg-green-600' : scanState === 'error' ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}>
            {scanLabel}
          </button>
          <button onClick={() => { setKey(''); router.push('/login') }} className="text-sm text-slate-400 hover:text-slate-700 transition">
            Sign out
          </button>
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
                  active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}>
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Pass stats + refreshStats to Overview via context would be ideal,
            but for simplicity Overview fetches its own data. */}
        {children}
      </main>
    </div>
  )
}
