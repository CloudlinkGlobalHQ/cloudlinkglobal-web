/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Database, RefreshCw, Search, ShieldAlert } from 'lucide-react'
import { getResources } from '../../lib/api'

const TYPE_ICONS: Record<string, string> = {
  ec2_instance: 'EC2', security_group: 'SG', aws_cost: 'COST', s3_bucket: 'S3',
  rds_instance: 'RDS', lambda_function: 'LAMBDA', ebs_volume: 'EBS',
  gce_instance: 'GCE', gcs_bucket: 'GCS', gcp_firewall_rule: 'FW',
  bigquery_dataset: 'BQ', gcp_cloudsql_instance: 'SQL', gcp_cost: 'COST',
  azure_vm: 'VM', azure_nsg: 'NSG', azure_storage_account: 'STO',
  azure_public_ip: 'IP', azure_managed_disk: 'DISK', azure_cost: 'COST',
}
const PROVIDER_COLORS: Record<string, string> = {
  aws: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  gcp: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  azure: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
}
const ISSUE_COLORS: Record<string, string> = {
  publicly_accessible: 'bg-red-500/15 text-red-400',
  public_access_not_fully_blocked: 'bg-red-500/15 text-red-400',
  no_public_access_block: 'bg-red-500/15 text-red-400',
  no_encryption: 'bg-yellow-500/15 text-yellow-400',
  versioning_disabled: 'bg-[#1A2340] text-[#64748B]',
  no_automated_backups: 'bg-orange-500/15 text-orange-400',
  no_backup_configuration: 'bg-orange-500/15 text-orange-400',
  unattached: 'bg-orange-500/15 text-orange-400',
  unattached_disk: 'bg-orange-500/15 text-orange-400',
  https_not_enforced: 'bg-red-500/15 text-red-400',
  public_ip_assigned: 'bg-red-500/15 text-red-400',
}

function IssueTag({ issue }: { issue: string }) {
  const key = issue.split(':')[0]
  const cls = ISSUE_COLORS[key] || 'bg-[#1A2340] text-[#94A3B8]'
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cls}`}>{key.replace(/_/g, ' ')}</span>
}

function ResourceDetail({ r }: { r: any }) {
  const p = r.payload || {}
  const type = r.resource_type
  if (type === 'ec2_instance') return (
    <div className="flex flex-wrap items-center gap-1.5">
      {p.name && p.name !== r.resource_id && <span className="font-medium text-[#E2E8F0]">{p.name}</span>}
      {p.instance_type && <span className="bg-[#1A2340] px-1.5 py-0.5 rounded text-xs text-[#94A3B8]">{p.instance_type}</span>}
      {p.avg_cpu_7d != null && <span className={`px-1.5 py-0.5 rounded text-xs ${p.is_idle ? 'bg-orange-500/15 text-orange-300' : 'bg-[#10B981]/15 text-[#6EE7B7]'}`}>CPU {p.avg_cpu_7d}%</span>}
      {p.is_idle && <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-orange-500/15 text-orange-300">Idle</span>}
    </div>
  )
  if (type === 'security_group') return (
    <div>
      {p.name && <span className="mr-2 font-medium text-[#E2E8F0]">{p.name}</span>}
      {p.vpc_id && <span className="mr-2 text-xs text-[#64748B]">{p.vpc_id}</span>}
      {p.open_ports?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {p.open_ports.map((x: any, i: number) => (
            <span key={i} className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-medium text-red-300">{x.label} :{x.port} ({x.cidr})</span>
          ))}
        </div>
      )}
    </div>
  )
  if (type === 'aws_cost') return (
    <div>
      <span className={`font-medium text-sm ${p.above_threshold ? 'text-red-300' : 'text-[#E2E8F0]'}`}>
        ${(p.mtd_cost || 0).toLocaleString()} MTD
      </span>
      <span className="ml-2 text-xs text-[#64748B]">({p.period_start} → {p.period_end})</span>
      {p.above_threshold && <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-xs text-red-300">Above threshold</span>}
    </div>
  )
  if (type === 's3_bucket') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.name}</span>
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'rds_instance') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.name}</span>
      {p.engine && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.engine} {p.engine_version}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'bigquery_dataset') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.dataset_id || p.name || r.resource_id}</span>
      {p.project_id && <span className="mr-2 text-xs text-[#64748B]">{p.project_id}</span>}
      {p.location && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.location}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'gcp_cloudsql_instance') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.name || r.resource_id}</span>
      {p.database_version && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.database_version}</span>}
      {p.project_id && <span className="mr-2 text-xs text-[#64748B]">{p.project_id}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'azure_public_ip') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.name || r.resource_id}</span>
      {p.ip_address && <span className="mr-2 text-xs text-[#64748B]">{p.ip_address}</span>}
      {p.sku && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.sku}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'azure_managed_disk') return (
    <div>
      <span className="mr-2 font-medium text-[#E2E8F0]">{p.name || r.resource_id}</span>
      {p.disk_size_gb != null && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.disk_size_gb} GB</span>}
      {p.sku && <span className="mr-1 rounded bg-[#1A2340] px-1.5 py-0.5 text-xs text-[#94A3B8]">{p.sku}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  return (
    <div className="flex flex-wrap gap-1">
      {(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}
      {(p.open_ports || []).map((x: any, i: number) => (
        <span key={i} className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-medium text-red-300">:{x.port}</span>
      ))}
    </div>
  )
}

export default function ResourcesTable() {
  const searchParams = useSearchParams()
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch]       = useState('')
  const [providerFilter, setProviderFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = providerFilter !== 'all' ? providerFilter : undefined
      const data = await getResources(provider)
      setResources(data.items || [])
    } catch (e: any) { setError(e?.message || 'Something went wrong') }
    setLoading(false)
  }

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const cloud = (searchParams.get('cloud') || '').toLowerCase()
    setSearch(q)
    if (cloud === 'aws' || cloud === 'azure' || cloud === 'gcp') setProviderFilter(cloud)
    else setProviderFilter('all')
  }, [searchParams])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [providerFilter])

  const types = ['all', ...Array.from(new Set(resources.map((r: any) => r.resource_type).filter(Boolean)))]
  const providers = ['all', ...Array.from(new Set(resources.map((r: any) => r.provider).filter(Boolean)))]
  const visible = resources.filter(r => {
    if (filterType !== 'all' && r.resource_type !== filterType) return false
    if (providerFilter !== 'all' && r.provider !== providerFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return r.resource_id?.toLowerCase().includes(q) || r.resource_type?.toLowerCase().includes(q) || (r.payload?.name || '').toLowerCase().includes(q)
    }
    return true
  })
  const withIssues = resources.filter(r => r.payload?.issues?.length > 0 || r.payload?.is_idle || r.payload?.open_ports?.length > 0)

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#F1F5F9]">Resources</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {resources.length} cloud resources discovered
            {withIssues.length > 0 && <span className="ml-2 font-medium text-[#F59E0B]">• {withIssues.length} with issues</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/credentials"
            className="rounded-xl border border-[#1E2D4F] bg-[#0F1629] px-3.5 py-2 text-sm font-medium text-[#94A3B8] transition hover:border-[#2E3D5F] hover:text-[#F1F5F9]"
          >
            Manage credentials
          </Link>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E2D4F] bg-[#141C33] px-3.5 py-2 text-sm font-medium text-[#94A3B8] transition hover:border-[#2E3D5F] hover:text-[#F1F5F9]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {resources.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1 sm:max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5070]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources, services, and IDs"
              className="w-full rounded-xl border border-[#1E2D4F] bg-[#0F1629] py-2 pl-9 pr-3 text-sm text-[#F1F5F9] placeholder:text-[#3D5070] focus:border-[#10B981]/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {providers.map((provider) => (
              <button
                key={provider}
                onClick={() => setProviderFilter(provider)}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${providerFilter === provider ? 'bg-[#10B981] text-white border-[#10B981]' : 'border-[#1E2D4F] bg-[#0F1629] text-[#94A3B8] hover:border-[#2E3D5F] hover:text-[#F1F5F9]'}`}
              >
                {provider === 'all' ? 'All Clouds' : provider.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${filterType === t ? 'bg-[#10B981] text-white border-[#10B981]' : 'border-[#1E2D4F] bg-[#0F1629] text-[#94A3B8] hover:border-[#2E3D5F] hover:text-[#F1F5F9]'}`}>
                {t === 'all' ? `All (${resources.length})` : `${TYPE_ICONS[t] || 'GEN'} ${t.replace(/_/g, ' ')} (${resources.filter(r => r.resource_type === t).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-[#1E2D4F] bg-[#0F1629] shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="grid grid-cols-[1.2fr_1.4fr_0.7fr_0.7fr_2fr] gap-3 rounded-2xl border border-[#1E2D4F] bg-[#141C33] px-4 py-4">
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
                <div className="h-4 animate-pulse rounded bg-[#1E2D4F]" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1E2D4F] bg-[#141C33]">
              {resources.length === 0 ? <Database size={22} className="text-[#10B981]" /> : <ShieldAlert size={22} className="text-[#F59E0B]" />}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#F1F5F9]">
                {resources.length === 0 ? 'No resources scanned yet' : 'No resources match these filters'}
              </p>
              <p className="max-w-md text-sm text-[#64748B]">
                {resources.length === 0
                  ? 'Connect a cloud account and run your first scan to populate compute, storage, database, and networking resources.'
                  : 'Try clearing your search terms or switching to a broader resource type or provider.'}
              </p>
            </div>
            {resources.length === 0 ? (
              <Link
                href="/dashboard/credentials"
                className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#059669]"
              >
                Connect a cloud account
              </Link>
            ) : (
              <button
                onClick={() => {
                  setFilterType('all')
                  setSearch('')
                }}
                className="rounded-xl border border-[#1E2D4F] bg-[#141C33] px-4 py-2 text-sm font-medium text-[#94A3B8] transition hover:border-[#2E3D5F] hover:text-[#F1F5F9]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
              <tr>
                {['Type', 'Resource ID', 'Cloud', 'Region', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4F]">
              {visible.map(r => (
                <tr key={r.resource_id} className="transition hover:bg-[#141C33]/80">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="mr-2 inline-flex rounded-md border border-[#1E2D4F] bg-[#141C33] px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">{TYPE_ICONS[r.resource_type] || 'GEN'}</span>
                    <span className="text-xs text-[#94A3B8]">{r.resource_type?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="max-w-[240px] px-4 py-3 font-mono text-xs text-[#E2E8F0]">
                    <span className="truncate block" title={r.resource_id}>{r.resource_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.provider && <span className={`text-xs border px-2 py-0.5 rounded font-medium ${PROVIDER_COLORS[r.provider] || 'bg-[#141C33] border-[#1E2D4F] text-[#94A3B8]'}`}>{r.provider?.toUpperCase()}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-[#64748B]">{r.region || '—'}</td>
                  <td className="px-4 py-3"><ResourceDetail r={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
