'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle, ExternalLink } from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const SPEND_DATA = [
  { day: 'Mar 1',  current: 4200, last: 3800 },
  { day: 'Mar 2',  current: 4350, last: 3900 },
  { day: 'Mar 3',  current: 4180, last: 3750 },
  { day: 'Mar 4',  current: 4520, last: 3820 },
  { day: 'Mar 5',  current: 4680, last: 3910 },
  { day: 'Mar 6',  current: 4410, last: 3780 },
  { day: 'Mar 7',  current: 4290, last: 3860 },
  { day: 'Mar 8',  current: 4750, last: 3920 },
  { day: 'Mar 9',  current: 4890, last: 4010 },
  { day: 'Mar 10', current: 4630, last: 3950 },
  { day: 'Mar 11', current: 4420, last: 3870 },
  { day: 'Mar 12', current: 4580, last: 3990 },
  { day: 'Mar 13', current: 5120, last: 4050 },
  { day: 'Mar 14', current: 5340, last: 4120 },
  { day: 'Mar 15', current: 5180, last: 4080 },
  { day: 'Mar 16', current: 4920, last: 4000 },
  { day: 'Mar 17', current: 4760, last: 3970 },
  { day: 'Mar 18', current: 5050, last: 4140 },
  { day: 'Mar 19', current: 5280, last: 4200 },
  { day: 'Mar 20', current: 5410, last: 4280 },
  { day: 'Mar 21', current: 5190, last: 4160 },
  { day: 'Mar 22', current: 4980, last: 4090 },
  { day: 'Mar 23', current: 5320, last: 4220 },
  { day: 'Mar 24', current: 5480, last: 4310 },
  { day: 'Mar 25', current: 5250, last: 4180 },
  { day: 'Mar 26', current: 5090, last: 4100 },
]

const SAVINGS_PIE = [
  { name: 'AutoStopping',          value: 6200 },
  { name: 'Idle Resources',        value: 4800 },
  { name: 'Regression Prevention', value: 4400 },
  { name: 'Misc Fixes',            value: 2800 },
]
const PIE_COLORS = ['#10B981', '#10B981', '#F59E0B', '#059669']

const REGRESSIONS = [
  { service: 'payments-service', deploy: 'a3f9b2', detected: '2h ago',  impact: '+$847/mo',   status: 'DETECTED' },
  { service: 'auth-service',     deploy: 'b7c1d3', detected: '1d ago',  impact: '+$234/mo',   status: 'FIXING' },
  { service: 'api-gateway',      deploy: 'c9e2f4', detected: '2d ago',  impact: '+$1,203/mo', status: 'RESOLVED' },
  { service: 'data-pipeline',    deploy: 'd4a5b6', detected: '3d ago',  impact: '+$456/mo',   status: 'RESOLVED' },
  { service: 'ml-training',      deploy: 'e8f9a0', detected: '5d ago',  impact: '+$2,891/mo', status: 'RESOLVED' },
]

const TOP_SERVICES = [
  { name: 'EC2',          cost: 62400 },
  { name: 'RDS',          cost: 28100 },
  { name: 'Lambda',       cost: 18900 },
  { name: 'S3',           cost: 12300 },
  { name: 'CloudFront',   cost: 8400 },
  { name: 'EKS',          cost: 6200 },
  { name: 'ElastiCache',  cost: 3800 },
  { name: 'SNS',          cost: 2740 },
]

const AUTOSTOP_EVENTS = [
  { time: '09:14', description: 'dev-env-payments stopped',    saving: '$0.82/hr', type: 'stop' },
  { time: '10:31', description: 'staging-api stopped',         saving: '$1.24/hr', type: 'stop' },
  { time: '11:45', description: 'ml-training-dev stopped',     saving: '$3.40/hr', type: 'stop' },
  { time: '14:22', description: 'dev-env-payments started',    saving: 'traffic detected', type: 'start' },
  { time: '16:08', description: 'staging-frontend stopped',    saving: '$0.67/hr', type: 'stop' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD = 'bg-[#141C33] border border-[#1E2D4F] rounded-xl'
const SECTION_LABEL = 'text-[10px] font-semibold uppercase tracking-widest text-[#3D5070]'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DETECTED: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    FIXING:   'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    RESOLVED: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] || 'bg-[#1E2D4F] text-[#64748B]'}`}>
      {status === 'FIXING' ? (
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
          {status}
        </span>
      ) : status}
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
          <span className="text-[#F1F5F9] font-medium">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#F1F5F9] font-medium">{label}</p>
      <p className="text-[#10B981] mt-1">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#F1F5F9] font-medium">{payload[0].name}</p>
      <p className="text-[#10B981] mt-1">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, trend, trendLabel, sub, valueColor, delay,
}: {
  title: string; value: string; trend?: string; trendLabel?: string
  sub?: string; valueColor?: string; delay: number
}) {
  const isUp = trend?.startsWith('+')
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function Overview({ stats, onRefresh }: { stats: any; onRefresh: () => void }) {
  const [hoveredPie, setHoveredPie] = useState<number | null>(null)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Overview</h1>
          <p className="text-xs text-[#64748B] mt-0.5">March 2026 · AWS · All services</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141C33] border border-[#1E2D4F] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#2E3D5F] transition"
        >
          Refresh
        </button>
      </div>

      {/* ROW 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Cloud Spend"  value="$142,840" trend="+3.2%"  trendLabel="vs last month" delay={0}    />
        <KpiCard title="Verified Savings"   value="$18,200"  trend="+12%"   trendLabel="vs last month" valueColor="text-[#10B981]" delay={0.05} />
        <KpiCard title="Cloudlink Fee"      value="$2,730"   sub="15% of savings"                      delay={0.1}  />
        <KpiCard title="Net Savings"        value="$15,470"  valueColor="text-[#10B981] text-3xl font-bold" delay={0.15} />
        <KpiCard title="Open Issues"        value="14"       trend="-3"     trendLabel="vs last week"  valueColor="text-[#F59E0B]" delay={0.2}  />
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
              <p className="text-xs text-[#64748B] mt-0.5">Daily spend, current vs prior month</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#10B981] rounded" />
                This month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#1E2D4F] rounded" />
                Last month
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SPEND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3D5070" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3D5070" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#3D5070', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#3D5070', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x="Mar 13" stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '⚠', fill: '#EF4444', fontSize: 10, position: 'top' }} />
              <ReferenceLine x="Mar 19" stroke="#EF4444" strokeDasharray="4 3" strokeWidth={1.5} />
              <Area type="monotone" dataKey="last"    stroke="#3D5070" strokeWidth={1.5} fill="url(#gradLast)"    dot={false} />
              <Area type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2}   fill="url(#gradCurrent)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Savings Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`${CARD} p-5 lg:col-span-2`}
        >
          <p className={SECTION_LABEL + ' mb-4'}>Savings Breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={SAVINGS_PIE}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, i) => setHoveredPie(i)}
                onMouseLeave={() => setHoveredPie(null)}
              >
                {SAVINGS_PIE.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i]}
                    opacity={hoveredPie === null || hoveredPie === i ? 1 : 0.5}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {SAVINGS_PIE.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-[#94A3B8]">{item.name}</span>
                </div>
                <span className="text-[#F1F5F9] font-medium">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
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
          <a href="/dashboard/regressions" className="text-xs text-[#10B981] hover:text-[#34D399] flex items-center gap-1 transition">
            View All <ExternalLink size={10} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E2D4F]">
                {['Service', 'Deploy', 'Detected', 'Cost Impact', 'Status', 'Action'].map((h) => (
                  <th key={h} className="pb-2 text-left text-[#3D5070] font-semibold tracking-wider uppercase pr-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REGRESSIONS.map((row, i) => (
                <tr key={i} className="border-b border-[#1E2D4F]/50 last:border-0 hover:bg-[#1E2D4F]/20 transition">
                  <td className="py-3 pr-4 font-medium text-[#F1F5F9] whitespace-nowrap">{row.service}</td>
                  <td className="py-3 pr-4">
                    <code className="text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded text-[10px]">{row.deploy}</code>
                  </td>
                  <td className="py-3 pr-4 text-[#64748B] whitespace-nowrap">{row.detected}</td>
                  <td className="py-3 pr-4 text-[#F59E0B] font-medium whitespace-nowrap">{row.impact}</td>
                  <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                  <td className="py-3">
                    <button className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                      row.status === 'DETECTED'
                        ? 'bg-[#10B981] text-white hover:bg-[#34D399]'
                        : 'bg-[#1E2D4F] text-[#94A3B8] hover:bg-[#2E3D5F]'
                    }`}>
                      {row.status === 'DETECTED' ? 'Fix' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={TOP_SERVICES}
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
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#1E2D4F', opacity: 0.5 }} />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {TOP_SERVICES.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? '#10B981' : i === 1 ? '#34D399' : '#2E3D5F'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-full">
              Saved $4.73 today
            </span>
          </div>
          <div className="space-y-1">
            {AUTOSTOP_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                className="flex items-start gap-3 py-2.5 border-b border-[#1E2D4F]/50 last:border-0"
              >
                <span className="text-[10px] text-[#3D5070] font-mono pt-0.5 w-10 flex-shrink-0">{event.time}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${event.type === 'stop' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#94A3B8]">{event.description}</p>
                  <p className={`text-[10px] mt-0.5 font-medium ${event.type === 'stop' ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                    {event.type === 'stop' ? `saved ${event.saving}` : event.saving}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#1E2D4F]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Resources currently stopped</span>
              <span className="text-[#F1F5F9] font-semibold">3 instances</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[#64748B]">Projected monthly savings</span>
              <span className="text-[#10B981] font-semibold">~$142/mo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
