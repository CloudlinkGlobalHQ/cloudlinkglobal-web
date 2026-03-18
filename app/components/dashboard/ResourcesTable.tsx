'use client'

import { useEffect, useState } from 'react'
import { getResources } from '../../lib/api'

const TYPE_ICONS: Record<string, string> = {
  ec2_instance: '🖥️', security_group: '🔒', aws_cost: '💰', s3_bucket: '🪣',
  rds_instance: '🗄️', lambda_function: 'λ', ebs_volume: '💾',
  gce_instance: '🖥️', gcs_bucket: '🪣', gcp_firewall_rule: '🔒',
  azure_vm: '🖥️', azure_nsg: '🔒', azure_storage_account: '🪣',
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
  versioning_disabled: 'bg-slate-100 text-slate-600',
  no_automated_backups: 'bg-orange-100 text-orange-700',
  unattached: 'bg-orange-100 text-orange-700',
  https_not_enforced: 'bg-red-100 text-red-700',
}

function IssueTag({ issue }: { issue: string }) {
  const key = issue.split(':')[0]
  const cls = ISSUE_COLORS[key] || 'bg-slate-100 text-slate-600'
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cls}`}>{key.replace(/_/g, ' ')}</span>
}

function ResourceDetail({ r }: { r: any }) {
  const p = r.payload || {}
  const type = r.resource_type
  if (type === 'ec2_instance') return (
    <div className="flex flex-wrap items-center gap-1.5">
      {p.name && p.name !== r.resource_id && <span className="font-medium text-slate-700">{p.name}</span>}
      {p.instance_type && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">{p.instance_type}</span>}
      {p.avg_cpu_7d != null && <span className={`px-1.5 py-0.5 rounded text-xs ${p.is_idle ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>CPU {p.avg_cpu_7d}%</span>}
      {p.is_idle && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-medium">⚠ Idle</span>}
    </div>
  )
  if (type === 'security_group') return (
    <div>
      {p.name && <span className="font-medium text-slate-700 mr-2">{p.name}</span>}
      {p.vpc_id && <span className="text-slate-400 mr-2 text-xs">{p.vpc_id}</span>}
      {p.open_ports?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {p.open_ports.map((x: any, i: number) => (
            <span key={i} className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">🚨 {x.label} :{x.port} ({x.cidr})</span>
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
      {p.engine && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs mr-1">{p.engine} {p.engine_version}</span>}
      <div className="flex flex-wrap gap-1 mt-1">{(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}</div>
    </div>
  )
  return (
    <div className="flex flex-wrap gap-1">
      {(p.issues || []).map((iss: string, i: number) => <IssueTag key={i} issue={iss} />)}
      {(p.open_ports || []).map((x: any, i: number) => (
        <span key={i} className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">🚨 :{x.port}</span>
      ))}
    </div>
  )
}

export default function ResourcesTable() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch]       = useState('')

  const load = async () => {
    setLoading(true)
    try { const data = await getResources(); setResources(data.items || []) } catch {}
    setLoading(false)
  }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
          <p className="text-slate-500 text-sm mt-1">
            {resources.length} cloud resources discovered
            {withIssues.length > 0 && <span className="ml-2 text-orange-600 font-medium">• {withIssues.length} with issues</span>}
          </p>
        </div>
        <button onClick={load} className="text-sm text-green-600 hover:underline">↻ Refresh</button>
      </div>

      {resources.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
            className="border border-slate-200 text-sm rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-48" />
          <div className="flex gap-1.5 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${filterType === t ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {t === 'all' ? `All (${resources.length})` : `${TYPE_ICONS[t] || '☁️'} ${t.replace(/_/g, ' ')} (${resources.filter(r => r.resource_type === t).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            {resources.length === 0 ? 'No resources tracked yet. Add a cloud credential and click Run scan.' : 'No resources match your filter.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Type', 'Resource ID', 'Cloud', 'Region', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(r => (
                <tr key={r.resource_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="mr-1">{TYPE_ICONS[r.resource_type] || '☁️'}</span>
                    <span className="text-slate-600 text-xs">{r.resource_type?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 max-w-[200px]">
                    <span className="truncate block" title={r.resource_id}>{r.resource_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.provider && <span className={`text-xs border px-2 py-0.5 rounded font-medium ${PROVIDER_COLORS[r.provider] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{r.provider?.toUpperCase()}</span>}
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
