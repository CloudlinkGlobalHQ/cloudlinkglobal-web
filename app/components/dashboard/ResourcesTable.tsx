/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
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
  aws: 'bg-orange-50 text-orange-700 border-orange-200',
  gcp: 'bg-blue-50 text-blue-700 border-blue-200',
  azure: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}
const ISSUE_COLORS: Record<string, string> = {
  publicly_accessible: 'bg-red-100 text-red-700',
  public_access_not_fully_blocked: 'bg-red-100 text-red-700',
  no_public_access_block: 'bg-red-100 text-red-700',
  no_encryption: 'bg-yellow-100 text-yellow-700',
  versioning_disabled: 'bg-[#1A2340] text-slate-600',
  no_automated_backups: 'bg-orange-100 text-orange-700',
  no_backup_configuration: 'bg-orange-100 text-orange-700',
  unattached: 'bg-orange-100 text-orange-700',
  unattached_disk: 'bg-orange-100 text-orange-700',
  https_not_enforced: 'bg-red-100 text-red-700',
  public_ip_assigned: 'bg-red-100 text-red-700',
}

function IssueTag({ issue }: { issue: string }) {
  const key = issue.split(':')[0]
  const cls = ISSUE_COLORS[key] || 'bg-[#1A2340] text-slate-600'
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cls}`}>{key.replace(/_/g, ' ')}</span>
}

function ResourceDetail({ r }: { r: any }) {
  const p = r.payload || {}
  const type = r.resource_type
  if (type === 'ec2_instance') return (
    <div className="flex flex-wrap items-center gap-1.5">
      {p.name && p.name !== r.resource_id && <span className="font-medium text-slate-700">{p.name}</span>}
      {p.instance_type && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs">{p.instance_type}</span>}
      {p.avg_cpu_7d != null && <span className={`px-1.5 py-0.5 rounded text-xs ${p.is_idle ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>CPU {p.avg_cpu_7d}%</span>}
      {p.is_idle && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-medium">Idle</span>}
    </div>
  )
  if (type === 'security_group') return (
    <div>
      {p.name && <span className="font-medium text-slate-700 mr-2">{p.name}</span>}
      {p.vpc_id && <span className="text-slate-400 mr-2 text-xs">{p.vpc_id}</span>}
      {p.open_ports?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {p.open_ports.map((x: any, i: number) => (
            <span key={i} className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">{x.label} :{x.port} ({x.cidr})</span>
          ))}
        </div>
      )}
    </div>
  )
  if (type === 'aws_cost') return (
    <div>
      <span className={`font-medium text-sm ${p.above_threshold ? 'text-red-600' : 'text-slate-700'}`}>
        ${(p.mtd_cost || 0).toLocaleString()} MTD
      </span>
      <span className="text-slate-400 text-xs ml-2">({p.period_start} → {p.period_end})</span>
      {p.above_threshold && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Above threshold</span>}
    </div>
  )
  if (type === 's3_bucket') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.name}</span>
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'rds_instance') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.name}</span>
      {p.engine && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.engine} {p.engine_version}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'bigquery_dataset') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.dataset_id || p.name || r.resource_id}</span>
      {p.project_id && <span className="text-slate-400 mr-2 text-xs">{p.project_id}</span>}
      {p.location && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.location}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'gcp_cloudsql_instance') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.name || r.resource_id}</span>
      {p.database_version && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.database_version}</span>}
      {p.project_id && <span className="text-slate-400 mr-2 text-xs">{p.project_id}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'azure_public_ip') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.name || r.resource_id}</span>
      {p.ip_address && <span className="text-slate-500 text-xs mr-2">{p.ip_address}</span>}
      {p.sku && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.sku}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  if (type === 'azure_managed_disk') return (
    <div>
      <span className="font-medium text-slate-700 mr-2">{p.name || r.resource_id}</span>
      {p.disk_size_gb != null && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.disk_size_gb} GB</span>}
      {p.sku && <span className="bg-[#1A2340] text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.sku}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  return (
    <div className="flex flex-wrap gap-1">
      {(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}
      {(p.open_ports || []).map((x: any, i: number) => (
        <span key={i} className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">:{x.port}</span>
      ))}
    </div>
  )
}

export default function ResourcesTable() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch]       = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try { const data = await getResources(); setResources(data.items || []) } catch (e: any) { setError(e?.message || 'Something went wrong') }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const types = ['all', ...Array.from(new Set(resources.map((r: any) => r.resource_type).filter(Boolean)))]
  const visible = resources.filter(r => {
    if (filterType !== 'all' && r.resource_type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      return r.resource_id?.toLowerCase().includes(q) || r.resource_type?.toLowerCase().includes(q) || (r.payload?.name || '').toLowerCase().includes(q)
    }
    return true
  })
  const withIssues = resources.filter(r => r.payload?.issues?.length > 0 || r.payload?.is_idle || r.payload?.open_ports?.length > 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Resources</h1>
          <p className="text-slate-500 text-sm mt-1">
            {resources.length} cloud resources discovered
            {withIssues.length > 0 && <span className="ml-2 text-orange-600 font-medium">• {withIssues.length} with issues</span>}
          </p>
        </div>
        <button onClick={load} className="rounded-xl border border-[#1E2D4F] px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#141C33]">Refresh</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {resources.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
            className="min-w-48 rounded-xl border border-[#1E2D4F] bg-[#0F1629] px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="flex gap-1.5 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${filterType === t ? 'bg-green-600 text-white border-green-600' : 'border-[#1E2D4F] text-slate-600 hover:bg-[#141C33]'}`}>
                {t === 'all' ? `All (${resources.length})` : `${TYPE_ICONS[t] || 'GEN'} ${t.replace(/_/g, ' ')} (${resources.filter(r => r.resource_type === t).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-[#1E2D4F] bg-[#0F1629] shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            {resources.length === 0 ? 'No resources tracked yet. Add a cloud credential and click Run scan.' : 'No resources match your filter.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
              <tr>
                {['Type', 'Resource ID', 'Cloud', 'Region', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(r => (
                <tr key={r.resource_id} className="transition hover:bg-[#141C33]/80">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="mr-2 inline-flex rounded-md border border-[#1E2D4F] bg-[#141C33] px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{TYPE_ICONS[r.resource_type] || 'GEN'}</span>
                    <span className="text-slate-600 text-xs">{r.resource_type?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 max-w-[200px]">
                    <span className="truncate block" title={r.resource_id}>{r.resource_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.provider && <span className={`text-xs border px-2 py-0.5 rounded font-medium ${PROVIDER_COLORS[r.provider] || 'bg-[#141C33] text-slate-600 border-[#1E2D4F]'}`}>{r.provider?.toUpperCase()}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.region || '—'}</td>
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
