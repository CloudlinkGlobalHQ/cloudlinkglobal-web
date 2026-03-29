/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getAuditLog } from '../../lib/api'

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED:  'bg-red-100 text-red-600',
  RETRY:   'bg-orange-100 text-orange-700',
  SKIPPED: 'bg-[#1A2340] text-slate-400',
  DRY_RUN: 'bg-blue-100 text-blue-700',
}

export default function AuditLog() {
  const [entries, setEntries]     = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [filterType, setFilterType]     = useState('')
  const [filterResource, setFilterResource] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = { limit: 100 }
      if (filterType) params.action_type = filterType
      if (filterResource) params.resource_id = filterResource
      const d = await getAuditLog(params)
      setEntries(d.items || [])
    } catch (e: any) { setError((e as Error)?.message || 'Something went wrong') }
    setLoading(false)
  }

   
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [filterType, filterResource])

  const types = [...new Set(entries.map((e: any) => e.action_type).filter(Boolean))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Audit Log</h1>
          <p className="text-slate-500 text-sm mt-1">Every remediation action taken by Cloudlink</p>
        </div>
        <button onClick={load} className="text-sm text-green-600 hover:underline">Refresh</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-[#1E2D4F] text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All action types</option>
          {types.map(t => <option key={t as string} value={t as string}>{(t as string).replace(/_/g, ' ')}</option>)}
        </select>
        <input value={filterResource} onChange={e => setFilterResource(e.target.value)} placeholder="Filter by resource ID…"
          className="border border-[#1E2D4F] text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-64" />
        {(filterType || filterResource) && (
          <button onClick={() => { setFilterType(''); setFilterResource('') }} className="text-sm text-slate-400 hover:text-slate-600">✕ Clear</button>
        )}
      </div>

      <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No audit entries yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#141C33] border-b border-[#1E2D4F]">
              <tr>{['Action Type','Resource','Status','Detail','Completed At'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e: any) => (
                <tr key={e.result_id} className="hover:bg-[#141C33]">
                  <td className="px-4 py-3 font-medium text-slate-700">{e.action_type?.replace(/_/g, ' ') || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-xs"><span className="truncate block">{e.resource_id || '—'}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[e.status] || 'bg-[#1A2340] text-slate-400'}`}>{e.status || '—'}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-xs"><span className="truncate block">{e.detail || '—'}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{e.completed_at ? new Date(e.completed_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
