'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { CloudOff, PlugZap } from 'lucide-react'
import { getCostSummary, getStats, getCostSnapshots, getTrackedServices } from '@/app/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CostSnapshot {
  service?: string
  date?: string
  timestamp?: string
  cost?: number
  amount?: number
}

interface TrackedService {
  service?: string
  name?: string
  cost?: number
  total_cost?: number
  monthly_cost?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD = 'bg-[#141C33] border border-[#1E2D4F] rounded-xl'

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
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${CARD} p-5 space-y-3`}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className={`${CARD} p-5 space-y-3`}>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className={`${CARD} p-5 space-y-3`}>
        <Skeleton className="h-3 w-28" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-6">
        <CloudOff size={40} className="text-[#10B981]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">No cost data yet</h2>
      <p className="text-[#94A3B8] mb-8 max-w-sm">
        Connect your AWS account to start tracking spend and identifying savings opportunities.
      </p>
      <Link
        href="/dashboard/credentials"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-[#34D399] transition text-sm"
      >
        <PlugZap size={16} />
        Connect AWS Account
      </Link>
    </div>
  )
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#94A3B8] mb-1">{label}</p>
      <p className="text-[#10B981] font-semibold">{fmt(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3D5070] mb-2">{title}</p>
      <p className="text-2xl font-bold text-[#F1F5F9]">{value}</p>
      {sub && <p className="text-xs text-[#64748B] mt-1">{sub}</p>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CostExplorerPage() {
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [chartsReady, setChartsReady] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [costSummary, setCostSummary] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statsData, setStatsData] = useState<any>(null)
  const [snapshots, setSnapshots] = useState<CostSnapshot[]>([])
  const [services, setServices] = useState<TrackedService[]>([])

   
  useEffect(() => {
    async function load() {
      try {
        const [summaryResult, statsResult, snapshotsResult, servicesResult] =
          await Promise.allSettled([
            getCostSummary(),
            getStats(),
            getCostSnapshots(),
            getTrackedServices(),
          ])

        const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null
        const stats   = statsResult.status   === 'fulfilled' ? statsResult.value   : null
        const snaps   = snapshotsResult.status === 'fulfilled' ? snapshotsResult.value : null
        const svcs    = servicesResult.status === 'fulfilled' ? servicesResult.value : null

        setCostSummary(summary)
        setStatsData(stats)

        const snapsArray: CostSnapshot[] = Array.isArray(snaps)
          ? snaps
          : Array.isArray(snaps?.snapshots)
          ? snaps.snapshots
          : []
        setSnapshots(snapsArray)

        const svcsArray: TrackedService[] = Array.isArray(svcs)
          ? svcs
          : Array.isArray(svcs?.services)
          ? svcs.services
          : []
        setServices(svcsArray)

        // Determine empty state: no cost data at all
        const totalCost = summary?.total_cost ?? summary?.total ?? stats?.total_cost ?? 0
        const hasData =
          totalCost > 0 ||
          snapsArray.length > 0 ||
          svcsArray.length > 0 ||
          (summary?.by_service && summary.by_service.length > 0)

        setIsEmpty(!hasData)
      } catch {
        setIsEmpty(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setChartsReady(true)
  }, [])

  if (loading) return <LoadingSkeleton />
  if (isEmpty) return <EmptyState />

  // ─── Derived values ─────────────────────────────────────────────────────────

  const totalSpend: number =
    costSummary?.total_cost ?? costSummary?.total ?? statsData?.total_cost ?? 0

  // Build chart data from snapshots or daily_costs
  let chartData: { day: string; cost: number }[] = []
  if (snapshots.length > 0) {
    chartData = snapshots.map((s) => ({
      day: s.date ?? s.timestamp ?? '',
      cost: s.cost ?? s.amount ?? 0,
    }))
  } else if (Array.isArray(costSummary?.daily_costs)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartData = costSummary.daily_costs.map((d: any) => ({
      day: d.date ?? d.day ?? '',
      cost: d.cost ?? d.amount ?? d.value ?? 0,
    }))
  }

  const dailyAvg =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.cost, 0) / chartData.length
      : 0

  // Top service
  const byService: { service?: string; name?: string; cost?: number; amount?: number }[] =
    Array.isArray(costSummary?.by_service)
      ? costSummary.by_service
      : services.map((s) => ({
          name: s.service ?? s.name ?? 'Unknown',
          cost: s.cost ?? s.total_cost ?? s.monthly_cost ?? 0,
        }))

  const topService =
    byService.length > 0
      ? [...byService].sort(
          (a, b) => (b.cost ?? b.amount ?? 0) - (a.cost ?? a.amount ?? 0)
        )[0]
      : null

  const topServiceName = topService?.service ?? topService?.name ?? '—'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topServiceCost = topService?.cost ?? (topService as any)?.amount ?? 0

  // Table rows (services or by_service)
  const tableRows: { name: string; cost: number }[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (byService.length > 0 ? byService : services).map((s: any) => ({
      name: s.service ?? s.name ?? 'Unknown',
      cost: s.cost ?? s.amount ?? s.total_cost ?? s.monthly_cost ?? 0,
    }))

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Cost Explorer</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Live AWS spend data</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Spend This Month"
          value={fmt(totalSpend)}
          sub="Current billing period"
        />
        <KpiCard
          title="Daily Average"
          value={fmt(dailyAvg)}
          sub={chartData.length > 0 ? `Based on ${chartData.length} days` : 'Insufficient data'}
        />
        <KpiCard
          title="Top Service"
          value={topServiceName}
          sub={topServiceCost > 0 ? fmt(topServiceCost) : undefined}
        />
      </div>

      {/* Area Chart */}
      <div className={`${CARD} p-5`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3D5070] mb-4">
          Cost Over Time
        </p>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-[#64748B] text-sm">
            Collecting baseline data…
          </div>
        ) : chartsReady ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
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
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#3D5070', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#gradCost)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] animate-pulse rounded-xl bg-[#1E2D4F]" />
        )}
      </div>

      {/* Services Table */}
      <div className={`${CARD} p-5`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3D5070] mb-4">
          Tracked Services
        </p>
        {tableRows.length === 0 ? (
          <p className="text-sm text-[#64748B]">No services tracked yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E2D4F]">
                  <th className="pb-2 text-left text-[#3D5070] font-semibold uppercase tracking-wider pr-4">
                    Service
                  </th>
                  <th className="pb-2 text-right text-[#3D5070] font-semibold uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#1E2D4F]/50 last:border-0 hover:bg-[#1E2D4F]/20 transition"
                  >
                    <td className="py-3 pr-4 font-medium text-[#F1F5F9]">{row.name}</td>
                    <td className="py-3 text-right text-[#10B981] font-semibold">
                      {fmt(row.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
