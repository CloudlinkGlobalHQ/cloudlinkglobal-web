'use client'

import { useEffect, useState } from 'react'
import { getRuns } from '../../lib/api'

export default function RunsTable() {
  const [runs, setRuns]       = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const d = await getRuns(); setRuns(d.items || []) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Run History</h1>
          <p className="text-slate-500 text-sm mt-1">Every time the agent loop has executed</p>
        </div>
        <button onClick={load} className="text-sm text-green-600 hover:underline">↻ Refresh</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : runs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No runs yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Run ID','Started','Status','Claimed','Success','Failed','Retry'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map(r => (
                <tr key={r.run_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.run_id?.slice(0,8)}…</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{new Date(r.started_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.status || 'done'}</span></td>
                  <td className="px-4 py-3 text-center text-slate-700">{r.claimed_count ?? 0}</td>
                  <td className="px-4 py-3 text-center text-green-600">{r.success_count ?? 0}</td>
                  <td className="px-4 py-3 text-center text-red-500">{r.failed_count ?? 0}</td>
                  <td className="px-4 py-3 text-center text-orange-500">{r.retry_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
