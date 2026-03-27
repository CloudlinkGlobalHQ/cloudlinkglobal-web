'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, ExternalLink, PlugZap } from 'lucide-react'
import {
  getStats,
  getCostSummary,
  getSavingsReport,
  getRegressions,
  getAutostopEvents,
  getAutostopSavings,
} from '@/app/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD = 'bg-[#141C33] border border-[#1E2D4F] rounded-xl'
const SECTION_LABEL = 'text-[10px] font-semibold uppercase tracking-widest text-[#3D5070]'
const PIE_COLORS = ['#10B981', '#34D399', '#F59E0B', '#059669']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1E2D4F] rounded ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${CARD} p-5 space-y-3`}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`${CARD} p-5 lg:col-span-3 space-y-3`}>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className={`${CARD} p-5 lg:col-span-2 space-y-3`}>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-36 w-full rounded-full" />
        </div>
      </div>
      <div className={`${CARD} p-5 space-y-3`}>
        <Skeleton className="h-3 w-32" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty / Onboarding State ─────────────────────────────────────────────────

function OnboardingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-8">
        <PlugZap size={40} className="text-[#10B981]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-3">Welcome to Cloudlink</h2>
      <p className="text-[#94A3B8] mb-8 max-w-md">
        Connect your AWS account to unlock your dashboard. Here's what Cloudlink will do for you:
      </p>
      <ul className="text-left mb-10 space-y-3 max-w-sm w-full">
        {[
          'Scan your AWS resources for waste',
          'Detect deploy-linked cost regressions',
          'AutoStop idle environments',
          'Track savings in real time',
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-[#94A3B8]">
            <span className="text-[#10B981] font-bold mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard/credentials"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-[#34D399] transition text-sm"
      >
        Connect Your AWS Account →
      </Link>
      <p className="mt-4 text-xs text-[#64748B]">
        Takes 5 minutes. Read-only IAM role. No write access needed.
      </p>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase() ?? ''
  const styles: Record<string, string> = {
    DETECTED: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    FIXING:   'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    RESOLVED: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[upper] || 'bg-[#1E2D4F] text-[#64748B]'}`}>
      {upper === 'FIXING' ? (
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
          {upper}
        </span>
      ) : upper}
    </span>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#94A3B8] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#94A3B8]">{p.name === 'current' ? 'This Month' : 'Last Month'}:</span>
          <span className="text-[#F1F5F9] font-medium">${(p.value ?? 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function BarTooltipComp({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#F1F5F9] font-medium">{label}</p>
      <p className="text-[#10B981] mt-1">${(payload[0]?.value ?? 0).toLocaleString()}</p>
    </div>
  )
}

function PieTooltipComp({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#F1F5F9] font-medium">{payload[0].name}</p>
      <p className="text-[#10B981] mt-1">${(payload[0].value ?? 0).toLocaleString()}</p>
    </div>
  )
}

function KpiCard({
  title, value, trend, trendLabel, sub, valueColor, delay,
}: {
  title: string; value: string; trend?: string; trendLabel?: string
  sub?: string; valueColor?: string; delay: number
}) {
  const isUp   = trend?.startsWith('+')
  const isDown = trend?.startsWith('-')
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${CARD} p-5`}
    >
      <p className={SECTION_LABEL}>{title}</p>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${valueColor || 'text-[#F1F5F9]'}`}>
        {value}
      </p>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          isUp && !valueColor ? 'text-[#F59E0B]' : isDown ? 'text-[#10B981]' : 'text-[#10B981]'
        }`}>
          {isUp ? <ArrowUpRight size={12} /> : isDown ? <ArrowDownRight size={12} /> : null}
          <span>{trend} {trendLabel}</span>
        </div>
      )}
      {sub && <p className="mt-1 text-xs text-[#64748B]">{sub}</p>}
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Overview({ stats: _stats, onRefresh }: { stats: any; onRefresh: () => void }) {
  const [loading, setLoading]           = useState(true)
  const [isNewUser, setIsNewUser]       = useState(false)
  const [hoveredPie, setHoveredPie]     = useState<number | null>(null)

  // Data state
  const [statsData, setStatsData]         = useState<any>(null)
  const [costSummary, setCostSummary]     = useState<any>(null)
  const [savingsData, setSavingsData]     = useState<any>(null)
  const [regressions, setRegressions]     = useState<any[]>([])
  const [autostopEvents, setAutostopEvents] = useState<any[]>([])
  const [autostopSavings, setAutostopSavings] = useState<any>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.allSettled([
      getStats(),
      getCostSummary(),
      getSavingsReport(),
      getRegressions(),
      getAutostopEvents(20),
      getAutostopSavings(),
    ]).then(([s, cs, sr, reg, ae, as_]) => {
      const stats_   = s.status   === 'fulfilled' ? s.value   : null
      const summary  = cs.status  === 'fulfilled' ? cs.value  : null
      const savings  = sr.status  === 'fulfilled' ? sr.value  : null
      const regs     = reg.status === 'fulfilled' ? reg.value : null
      const events   = ae.status  === 'fulfilled' ? ae.value  : null
      const asSav    = as_.status === 'fulfilled' ? as_.value : null

      setStatsData(stats_)
      setCostSummary(summary)
      setSavingsData(savings)
      setRegressions(
        Array.isArray(regs) ? regs : Array.isArray(regs?.regressions) ? regs.regressions : []
      )
      setAutostopEvents(
        Array.isArray(events) ? events : Array.isArray(events?.events) ? events.events : []
      )
      setAutostopSavings(asSav)

      // New user check: no stats, no cost, no credentials connected
      const totalCost = stats_?.total_cost ?? summary?.total_cost ?? summary?.total ?? 0
      const openIssues = stats_?.open_issues ?? 0
      const hasAnyData = totalCost > 0 || openIssues > 0 ||
        (Array.isArray(summary?.by_service) && summary.by_service.length > 0) ||
        (Array.isArray(regs) ? regs : []).length > 0

      setIsNewUser(!hasAnyData)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    onRefresh()
    fetchAll()
  }

  if (loading) return <LoadingSkeleton />
  if (isNewUser) return <OnboardingState />

  // ─── Derived KPI values ────────────────────────────────────────────────────

  const totalCost: number =
    statsData?.total_cost ?? costSummary?.total_cost ?? costSummary?.total ?? 0

  const totalSavings: number =
    savingsData?.total_savings ??
    savingsData?.total ??
    autostopSavings?.total_saved ??
    autostopSavings?.total_savings ??
    0

  const fee       = totalSavings * 0.15
  const netSavings = totalSavings * 0.85

  const openIssues: number =
    statsData?.open_issues ??
    regressions.filter((r) => r?.status !== 'resolved' && r?.status !== 'RESOLVED').length

  // ─── Spend chart data ──────────────────────────────────────────────────────

  const dailyCosts = Array.isArray(costSummary?.daily_costs) ? costSummary.daily_costs : []
  const spendData: { day: string; current: number }[] = dailyCosts.map((d: any) => ({
    day:     d.date ?? d.day ?? '',
    current: d.cost ?? d.amount ?? d.value ?? 0,
  }))

  // ─── Savings pie ───────────────────────────────────────────────────────────

  const rawPie = autostopSavings?.by_category ?? autostopSavings?.breakdown ?? []
  const savingsPie: { name: string; value: number }[] = Array.isArray(rawPie)
    ? rawPie.map((item: any) => ({
        name: item.category ?? item.name ?? 'Other',
        value: item.saved ?? item.amount ?? item.value ?? 0,
      }))
    : []

  // ─── Top cost drivers ──────────────────────────────────────────────────────

  const topServices: { name: string; cost: number }[] = (
    Array.isArray(costSummary?.by_service) ? costSummary.by_service : []
  ).map((s: any) => ({
    name: s.service ?? s.name ?? 'Unknown',
    cost: s.cost ?? s.amount ?? 0,
  }))

  // ─── AutoStop events ───────────────────────────────────────────────────────

  const todaySaved: number =
    autostopSavings?.today_saved ??
    autostopSavings?.saved_today ??
    0

  const stoppedCount: number =
    autostopSavings?.currently_stopped ??
    autostopSavings?.stopped_count ??
    autostopEvents.filter((e: any) => e?.action === 'stop' || e?.type === 'stop').length

  const projectedMonthly: number =
    autostopSavings?.projected_monthly ??
    autostopSavings?.monthly_projected ??
    0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Overview</h1>
          <p className="text-xs text-[#64748B] mt-0.5">AWS · All services</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141C33] border border-[#1E2D4F] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#2E3D5F] transition"
        >
          Refresh
        </button>
      </div>

      {/* ROW 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Cloud Spend"
          value={fmt(totalCost)}
          delay={0}
        />
        <KpiCard
          title="Verified Savings"
          value={fmt(totalSavings)}
          valueColor="text-[#10B981]"
          delay={0.05}
        />
        <KpiCard
          title="Cloudlink Fee"
          value={fmt(fee)}
          sub="15% of savings"
          delay={0.1}
        />
        <KpiCard
          title="Net Savings"
          value={fmt(netSavings)}
          valueColor="text-[#10B981] text-3xl font-bold"
          delay={0.15}
        />
        <KpiCard
          title="Open Issues"
          value={String(openIssues)}
          valueColor="text-[#F59E0B]"
          delay={0.2}
        />
      </div>

      {/* ROW 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Spend Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className={`${CARD} p-5 lg:col-span-3`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={SECTION_LABEL}>Cloud Spend Over Time</p>
              <p className="text-xs text-[#64748B] mt-0.5">Daily spend</p>
            </div>
          </div>
          {spendData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-[#64748B] text-sm">
              Collecting baseline data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#3D5070', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: '#3D5070', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#gradCurrent)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Savings Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`${CARD} p-5 lg:col-span-2`}
        >
          <p className={SECTION_LABEL + ' mb-4'}>Savings Breakdown</p>
          {savingsPie.length === 0 ? (
            <div className="h-[140px] flex items-center justify-center">
              <div className="text-center">
                {/* empty donut ring */}
                <div className="w-28 h-28 rounded-full border-4 border-[#1E2D4F] mx-auto flex items-center justify-center">
                  <span className="text-xs text-[#64748B]">No savings yet</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={savingsPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, i) => setHoveredPie(i)}
                    onMouseLeave={() => setHoveredPie(null)}
                  >
                    {savingsPie.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        opacity={hoveredPie === null || hoveredPie === i ? 1 : 0.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipComp />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {savingsPie.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-[#94A3B8]">{item.name}</span>
                    </div>
                    <span className="text-[#F1F5F9] font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ROW 3 — Regressions Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className={`${CARD} p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className={SECTION_LABEL}>Recent Regressions</p>
          <a
            href="/dashboard/regressions"
            className="text-xs text-[#10B981] hover:text-[#34D399] flex items-center gap-1 transition"
          >
            View All <ExternalLink size={10} />
          </a>
        </div>

        {regressions.length === 0 ? (
          <p className="text-sm text-[#10B981] py-4">
            No regressions detected — your deploys are clean ✓
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E2D4F]">
                  {['Service', 'Deploy', 'Detected', 'Cost Impact', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-left text-[#3D5070] font-semibold tracking-wider uppercase pr-4 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regressions.slice(0, 10).map((row: any, i: number) => {
                  const service = row?.service ?? row?.service_name ?? '—'
                  const deploy  = row?.deploy_id ?? row?.deploy ?? row?.commit ?? '—'
                  const detected = row?.detected_at ?? row?.created_at ?? row?.detected ?? '—'
                  const impact   = row?.cost_impact ?? row?.impact ?? '—'
                  const status   = (row?.status ?? 'DETECTED').toUpperCase()
                  return (
                    <tr
                      key={i}
                      className="border-b border-[#1E2D4F]/50 last:border-0 hover:bg-[#1E2D4F]/20 transition"
                    >
                      <td className="py-3 pr-4 font-medium text-[#F1F5F9] whitespace-nowrap">{service}</td>
                      <td className="py-3 pr-4">
                        <code className="text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded text-[10px]">
                          {String(deploy).slice(0, 7)}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-[#64748B] whitespace-nowrap">{String(detected)}</td>
                      <td className="py-3 pr-4 text-[#F59E0B] font-medium whitespace-nowrap">
                        {typeof impact === 'number' ? `+$${impact.toLocaleString()}/mo` : String(impact)}
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={status} /></td>
                      <td className="py-3">
                        <button
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                            status === 'DETECTED'
                              ? 'bg-[#10B981] text-white hover:bg-[#34D399]'
                              : 'bg-[#1E2D4F] text-[#94A3B8] hover:bg-[#2E3D5F]'
                          }`}
                        >
                          {status === 'DETECTED' ? 'Fix' : 'View'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ROW 4 — Cost Drivers + AutoStopping Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Cost Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`${CARD} p-5`}
        >
          <p className={SECTION_LABEL + ' mb-4'}>Top Cost Drivers</p>
          {topServices.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-[#64748B]">
              No service cost data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topServices}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#3D5070', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip content={<BarTooltipComp />} cursor={{ fill: '#1E2D4F', opacity: 0.5 }} />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                  {topServices.map((_: any, i: number) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#10B981' : i === 1 ? '#34D399' : '#2E3D5F'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* AutoStopping Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className={`${CARD} p-5`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={SECTION_LABEL}>AutoStopping Activity</p>
            {todaySaved > 0 && (
              <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-full">
                Saved {fmt(todaySaved)} today
              </span>
            )}
          </div>

          {autostopEvents.length === 0 ? (
            <div className="py-8 flex items-center justify-center text-sm text-[#64748B]">
              No AutoStopping activity yet
            </div>
          ) : (
            <div className="space-y-1">
              {autostopEvents.slice(0, 8).map((event: any, i: number) => {
                const evtType = event?.action ?? event?.type ?? 'stop'
                const isStop  = evtType === 'stop' || evtType === 'stopped'
                const time    = event?.timestamp ?? event?.time ?? event?.created_at ?? ''
                const desc    = event?.description ?? event?.resource_id ?? event?.resource ?? '—'
                const saving  = event?.saving ?? event?.cost_per_hour ?? event?.rate ?? ''
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                    className="flex items-start gap-3 py-2.5 border-b border-[#1E2D4F]/50 last:border-0"
                  >
                    <span className="text-[10px] text-[#3D5070] font-mono pt-0.5 w-10 flex-shrink-0 truncate">
                      {String(time).slice(-8, -3) || String(time).slice(0, 5)}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        isStop ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#94A3B8] truncate">{String(desc)}</p>
                      {saving ? (
                        <p className={`text-[10px] mt-0.5 font-medium ${isStop ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                          {isStop
                            ? `saved ${typeof saving === 'number' ? `$${saving}/hr` : saving}`
                            : String(saving)}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#1E2D4F]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Resources currently stopped</span>
              <span className="text-[#F1F5F9] font-semibold">{stoppedCount} instances</span>
            </div>
            {projectedMonthly > 0 && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#64748B]">Projected monthly savings</span>
                <span className="text-[#10B981] font-semibold">~{fmt(projectedMonthly)}/mo</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
