/* eslint-disable react-hooks/purity */
'use client'

import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface Snapshot {
  service: string
  hour: string
  cost_usd: number
}

const COLORS = ['#16a34a', '#3b82f6', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function CostTrendChart({ snapshots }: { snapshots: Snapshot[] }) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d')

  const { chartData, services } = useMemo(() => {
    if (!snapshots?.length) return { chartData: [], services: [] }

    const now = Date.now()
    const ranges = { '24h': 24, '7d': 168, '30d': 720 }
    const cutoff = now - ranges[range] * 3600 * 1000

    // Filter and group by hour
    const filtered = snapshots.filter(s => new Date(s.hour).getTime() >= cutoff)
    const svcSet = new Set<string>()
    const hourMap: Record<string, Record<string, number>> = {}

    for (const s of filtered) {
      svcSet.add(s.service)
      const hourKey = s.hour
      if (!hourMap[hourKey]) hourMap[hourKey] = {}
      hourMap[hourKey][s.service] = (hourMap[hourKey][s.service] || 0) + s.cost_usd
    }

    const services = Array.from(svcSet).sort()
    const hours = Object.keys(hourMap).sort()

    // Aggregate by time bucket for readability
    const bucketSize = range === '24h' ? 1 : range === '7d' ? 6 : 24 // hours per bucket
    const bucketed: Record<string, Record<string, number>> = {}

    for (const hour of hours) {
      const dt = new Date(hour)
      const bucketStart = new Date(dt)
      bucketStart.setHours(Math.floor(dt.getHours() / bucketSize) * bucketSize, 0, 0, 0)
      const key = bucketStart.toISOString()
      if (!bucketed[key]) bucketed[key] = {}
      for (const svc of services) {
        bucketed[key][svc] = (bucketed[key][svc] || 0) + (hourMap[hour][svc] || 0)
      }
    }

    const chartData = Object.entries(bucketed)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, data]) => {
        const dt = new Date(hour)
        const label = range === '24h'
          ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : range === '7d'
            ? dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
            : dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
        return { time: label, ...data }
      })

    return { chartData, services }
  }, [snapshots, range])

  if (!chartData.length) return null

  return (
    <div className="mb-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Cost Trend</h2>
          <p className="mt-1 text-xs text-slate-500">Service-level spend over time across the selected window.</p>
        </div>
        <div className="flex gap-1">
          {(['24h', '7d', '30d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                range === r ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)}`} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, String(name).replace('Amazon ', '').replace('AWS ', '')]}
          />
          <Legend iconType="circle" iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-600">{value.replace('Amazon ', '').replace('AWS ', '')}</span>} />
          {services.map((svc, i) => (
            <Area key={svc} type="monotone" dataKey={svc} stackId="1"
              stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15}
              strokeWidth={1.5} dot={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
