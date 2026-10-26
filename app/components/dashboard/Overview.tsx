'use client'

import Link from 'next/link'
import { getCostSummary, getCredentials, getResources, getRightsizing, getStats } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { usd } from '../../lib/format'
import { useScan } from '../../lib/scan'
import { displayName, findingsOf, TYPE_LABELS, type ScannedResource } from '../../lib/resources'
import { EmptyState, ErrorState, LoadingState, PageHeader } from './states'

const CARD = 'rounded-xl border border-[#1E2D4F] bg-[#141C33]'
const LABEL = 'text-[10px] font-semibold uppercase tracking-widest text-[#64748B]'

type Stats = { resources_count?: number; last_scan?: { finished_at?: string; started_at?: string; status?: string } | null }
type CostSummary = { total_mtd_usd?: number; top_services?: Record<string, number> }
type Overview = { credentials: unknown[]; stats: Stats; cost: CostSummary; resources: ScannedResource[] }

function when(iso?: string) {
  return iso ? new Date(iso).toLocaleString() : 'never'
}

async function loadOverview(): Promise<Overview> {
  const [creds, stats, cost, resources] = await Promise.all([getCredentials(), getStats(), getCostSummary(), getResources()])
  return {
    credentials: Array.isArray(creds?.items) ? creds.items : [],
    stats: stats || {},
    cost: cost || {},
    resources: Array.isArray(resources?.items) ? resources.items : [],
  }
}

function Kpi({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className={`${CARD} p-5`}>
      <p className={LABEL}>{title}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#F1F5F9]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#64748B]">{sub}</p>}
    </div>
  )
}

function RightsizingKpi() {
  const { data, error, loading } = useApi<{ total_monthly_savings_usd?: number; candidates?: number }>(() => getRightsizing(20))
  if (loading) return <Kpi title="Rightsizing estimate" value="…" sub="Loading" />
  if (error || !data) return <Kpi title="Rightsizing estimate" value="—" sub="Couldn’t load the estimate" />
  return (
    <Kpi
      title="Rightsizing estimate"
      value={`${usd(data.total_monthly_savings_usd ?? 0, 0)}/mo`}
      sub={`${data.candidates ?? 0} EC2 instance${data.candidates === 1 ? '' : 's'} under 20% CPU · approximate prices`}
    />
  )
}

export default function Overview() {
  const { data, error, loading, retry } = useApi(loadOverview)
  const scan = useScan()

  if (loading && !data) return <><PageHeader title="Overview" /><LoadingState label="Loading your AWS overview…" /></>
  if (error && !data) return <><PageHeader title="Overview" /><ErrorState error={error} onRetry={retry} /></>
  if (!data) return null

  if (data.credentials.length === 0) {
    return (
      <>
        <PageHeader title="Overview" />
        <EmptyState
          title="Connect your AWS account"
          body="Cloudlink scans with a read-only IAM role (Describe, Get and List permissions only). It never changes anything in your account."
          action={{ label: 'Connect AWS', href: '/dashboard/credentials' }}
        />
      </>
    )
  }

  const lastScan = data.stats.last_scan
  if (!lastScan && data.resources.length === 0) {
    return (
      <>
        <PageHeader title="Overview" />
        <EmptyState
          title="Run your first scan"
          body="Your AWS account is connected. A scan looks for idle and unused resources, risky settings and month-to-date cost."
          action={{ label: scan.status === 'running' ? 'Scanning…' : 'Run scan', onClick: () => { void scan.start() }, disabled: scan.status === 'running' }}
        />
      </>
    )
  }

  const total = data.cost.total_mtd_usd ?? 0
  const services = Object.entries(data.cost.top_services || {}).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxService = services[0]?.[1] || 1
  const flagged = data.resources
    .map((r) => ({ r, findings: findingsOf(r) }))
    .filter((x) => x.findings.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle={<>AWS · last scan {when(lastScan?.finished_at || lastScan?.started_at)}</>}
      />

      {error && <ErrorState error={error} onRetry={retry} compact />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="AWS spend this month" value={usd(total)} sub="Month to date, from AWS Cost Explorer" />
        <Kpi title="Resources scanned" value={String(data.stats.resources_count ?? data.resources.length)} />
        <Kpi title="Findings" value={String(flagged.length)} sub="Idle, unused or risky resources" />
        <RightsizingKpi />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${CARD} p-5`} aria-labelledby="top-services">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="top-services" className={LABEL}>Top services this month</h2>
            <Link href="/dashboard/cost-explorer" className="text-xs text-[#10B981] hover:text-[#34D399]">Cost Explorer</Link>
          </div>
          {services.length === 0 ? (
            <p className="py-6 text-sm text-[#64748B]">No cost breakdown yet. It appears after a scan that can read AWS Cost Explorer.</p>
          ) : (
            <ul className="space-y-3">
              {services.map(([name, cost]) => (
                <li key={name}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="truncate text-[#CBD5E1]" title={name}>{name}</span>
                    <span className="shrink-0 font-medium text-[#F1F5F9]">{usd(cost)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#1E2D4F]">
                    <div className="h-1.5 rounded-full bg-[#10B981]" style={{ width: `${Math.max(2, (cost / maxService) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${CARD} p-5`} aria-labelledby="findings">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="findings" className={LABEL}>Findings</h2>
            <Link href="/dashboard/resources" className="text-xs text-[#10B981] hover:text-[#34D399]">All resources</Link>
          </div>
          {flagged.length === 0 ? (
            <p className="py-6 text-sm text-[#64748B]">Nothing flagged in the last scan.</p>
          ) : (
            <ul className="divide-y divide-[#1E2D4F]">
              {flagged.slice(0, 8).map(({ r, findings }) => (
                <li key={r.resource_id} className="py-2.5">
                  <p className="truncate text-sm font-medium text-[#E2E8F0]" title={r.resource_id}>{displayName(r)}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {TYPE_LABELS[r.resource_type || ''] || r.resource_type} · {r.region || '—'} · <span className="text-amber-300">{findings.join(' · ')}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
