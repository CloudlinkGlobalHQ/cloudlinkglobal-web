'use client'

import { getCostSummary, getCredentials } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { usd } from '../../lib/format'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/dashboard/states'

const CARD = 'rounded-xl border border-[#1E2D4F] bg-[#141C33]'

type CostSummary = { total_mtd_usd?: number; top_services?: Record<string, number>; credential_count?: number }

async function load() {
  const [cost, creds] = await Promise.all([getCostSummary(), getCredentials()])
  return { cost: (cost || {}) as CostSummary, credentialCount: Array.isArray(creds?.items) ? creds.items.length : 0 }
}

export default function CostExplorerPage() {
  const { data, error, loading, retry } = useApi(load)
  const header = <PageHeader title="Cost Explorer" subtitle="Month-to-date AWS spend by service, from the last scan." />

  if (loading && !data) return <>{header}<LoadingState label="Loading cost data…" /></>
  if (error && !data) return <>{header}<ErrorState error={error} onRetry={retry} /></>
  if (!data) return null

  if (data.credentialCount === 0) {
    return <>{header}<EmptyState title="Connect your AWS account" body="Cost data comes from AWS Cost Explorer through your read-only role." action={{ label: 'Connect AWS', href: '/dashboard/credentials' }} /></>
  }

  const total = data.cost.total_mtd_usd ?? 0
  const services = Object.entries(data.cost.top_services || {}).sort((a, b) => b[1] - a[1])
  if (total === 0 && services.length === 0) {
    return <>{header}<EmptyState title="No cost data yet" body="Run a scan to pull month-to-date spend from AWS Cost Explorer." action={{ label: 'Go to Scans', href: '/dashboard/scans' }} /></>
  }
  const top = services[0]

  return (
    <div className="space-y-6">
      {header}
      {error && <ErrorState error={error} onRetry={retry} compact />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${CARD} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">Spend this month</p>
          <p className="mt-2 text-2xl font-bold text-[#F1F5F9]">{usd(total)}</p>
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">Top service</p>
          <p className="mt-2 truncate text-lg font-semibold text-[#F1F5F9]" title={top?.[0]}>{top?.[0] ?? '—'}</p>
          {top && <p className="text-xs text-[#64748B]">{usd(top[1])}</p>}
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">Daily trend</p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Coming soon. Scans don’t record daily cost history yet, so there is no chart to show.
          </p>
        </div>
      </div>

      <section className={`${CARD} overflow-x-auto`} aria-label="Spend by service">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="border-b border-[#1E2D4F]">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Service</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Month to date</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2D4F]">
            {services.map(([name, cost]) => (
              <tr key={name}>
                <td className="px-4 py-3 text-[#E2E8F0]">{name}</td>
                <td className="px-4 py-3 text-right font-medium text-[#F1F5F9]">{usd(cost)}</td>
                <td className="px-4 py-3 text-right text-[#94A3B8]">{total > 0 ? `${((cost / total) * 100).toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-[#1E2D4F] px-4 py-3 text-xs text-[#64748B]">The backend keeps the top 10 services; smaller ones are included in the total only.</p>
      </section>
    </div>
  )
}
