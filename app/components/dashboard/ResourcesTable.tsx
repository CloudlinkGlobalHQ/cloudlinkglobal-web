'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Search } from 'lucide-react'
import { getResources } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { usd } from '../../lib/format'
import { displayName, findingsOf, TYPE_LABELS, type ScannedResource } from '../../lib/resources'
import { EmptyState, ErrorState, LoadingState, PageHeader } from './states'

function Details({ r }: { r: ScannedResource }) {
  const p = r.payload || {}
  const findings = findingsOf(r)
  const facts: string[] = []
  if (r.resource_type === 'aws_cost') {
    const mtd = typeof p.mtd_cost === 'number' ? p.mtd_cost : 0
    facts.push(`${usd(mtd)} month to date`)
  }
  if (typeof p.instance_type === 'string') facts.push(p.instance_type)
  if (typeof p.instance_class === 'string') facts.push(p.instance_class)
  if (typeof p.engine === 'string') facts.push(p.engine)
  if (typeof p.runtime === 'string') facts.push(p.runtime)
  if (typeof p.size_gb === 'number') facts.push(`${p.size_gb} GB`)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {facts.map((f) => <span key={f} className="rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{f}</span>)}
      {findings.map((f) => <span key={f} className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-300">{f}</span>)}
    </div>
  )
}

export default function ResourcesTable() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [search, setSearch] = useState(q)
  const [filterType, setFilterType] = useState('all')
  const [onlyFindings, setOnlyFindings] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSearch(q) }, [q])

  const { data, error, loading, retry } = useApi(async () => {
    const res = await getResources()
    return (Array.isArray(res?.items) ? res.items : []) as ScannedResource[]
  })
  const resources = data || []

  const header = (
    <PageHeader
      title="Resources"
      subtitle={data ? `${resources.length} AWS resources from the last scan` : 'AWS resources found by your scans'}
      actions={
        <button type="button" onClick={retry} disabled={loading} className="dashboard-secondary-button inline-flex items-center gap-2 px-3.5 py-2 text-sm disabled:opacity-50">
          <RefreshCw size={14} aria-hidden /> Refresh
        </button>
      }
    />
  )

  if (loading && !data) return <>{header}<LoadingState label="Loading resources…" /></>
  if (error && !data) return <>{header}<ErrorState error={error} onRetry={retry} /></>
  if (resources.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="No resources scanned yet"
          body="Connect your AWS account and run a scan to see EC2, EBS, RDS, Lambda, S3 and security group findings."
          action={{ label: 'Connect AWS', href: '/dashboard/credentials' }}
        />
      </>
    )
  }

  const types = ['all', ...Array.from(new Set(resources.map((r) => r.resource_type).filter((t): t is string => !!t)))]
  const term = search.trim().toLowerCase()
  const visible = resources.filter((r) => {
    if (filterType !== 'all' && r.resource_type !== filterType) return false
    if (onlyFindings && findingsOf(r).length === 0) return false
    if (!term) return true
    return [r.resource_id, r.resource_type, displayName(r), r.region].some((v) => (v || '').toLowerCase().includes(term))
  })
  const withFindings = resources.filter((r) => findingsOf(r).length > 0).length

  return (
    <div className="space-y-5">
      {header}
      {error && <ErrorState error={error} onRetry={retry} compact />}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5070]" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, ID, type or region"
            aria-label="Filter resources"
            className="w-full rounded-xl border border-[#1E2D4F] bg-[#0F1629] py-2 pl-9 pr-3 text-sm text-[#F1F5F9] placeholder:text-[#3D5070] focus:border-[#10B981]/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          aria-pressed={onlyFindings}
          onClick={() => setOnlyFindings((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${onlyFindings ? 'border-[#10B981] bg-[#10B981] text-white' : 'border-[#1E2D4F] bg-[#0F1629] text-[#94A3B8] hover:text-[#F1F5F9]'}`}
        >
          With findings ({withFindings})
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={filterType === t}
            onClick={() => setFilterType(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${filterType === t ? 'border-[#10B981] bg-[#10B981] text-white' : 'border-[#1E2D4F] bg-[#0F1629] text-[#94A3B8] hover:text-[#F1F5F9]'}`}
          >
            {t === 'all' ? `All (${resources.length})` : `${TYPE_LABELS[t] || t} (${resources.filter((r) => r.resource_type === t).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No resources match these filters" action={{ label: 'Clear filters', onClick: () => { setFilterType('all'); setSearch(''); setOnlyFindings(false) } }} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1E2D4F] bg-[#0F1629]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
              <tr>
                {['Type', 'Resource', 'Region', 'Details'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4F]">
              {visible.map((r) => (
                <tr key={r.resource_id} className="hover:bg-[#141C33]/80">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#94A3B8]">{TYPE_LABELS[r.resource_type || ''] || r.resource_type}</td>
                  <td className="max-w-[260px] px-4 py-3">
                    <span className="block truncate text-[#E2E8F0]" title={r.resource_id}>{displayName(r)}</span>
                    {displayName(r) !== r.resource_id && <span className="block truncate font-mono text-[11px] text-[#64748B]">{r.resource_id}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#64748B]">{r.region || '—'}</td>
                  <td className="px-4 py-3"><Details r={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
