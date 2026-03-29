'use client'

import { useEffect, useState } from 'react'
import { getScans, scanNow } from '../../lib/api'

const STATUS_STYLES: Record<string, string> = {
  finished: 'bg-green-100 text-green-700',
  running:  'bg-blue-100 text-blue-700',
  error:    'bg-red-100 text-red-600',
}

function fmt(iso: string | null) { return iso ? new Date(iso).toLocaleString() : '—' }
function duration(start: string, end: string) {
  if (!start || !end) return '—'
  const s = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`
}

export default function ScansHistory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scans, setScans]     = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { const d = await getScans(); setScans(d.items || []) } catch (e: any) { setError(e?.message || 'Something went wrong') }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const handleScan = async () => {
    setScanning(true); setMsg('')
    try {
      const res = await scanNow()
      setMsg(`Scan complete — ${res.total_events_found ?? 0} events found across ${res.credentials_scanned ?? 0} credential(s)`)
      load()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { setMsg(`Error: ${e.message}`) }
    setScanning(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Scan History</h1>
          <p className="text-slate-500 text-sm mt-1">Every time Cloudlink scanned your cloud accounts</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          <button onClick={handleScan} disabled={scanning} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {scanning ? 'Scanning…' : '▶ Scan now'}
          </button>
          <button onClick={load} className="text-sm text-green-600 hover:underline">Refresh</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
      <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : scans.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No scans yet. Add a credential and click Scan now.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#141C33] border-b border-[#1E2D4F]">
              <tr>{['Scan ID','Credential','Regions','Started','Duration','Status','Events','Actions Queued'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scans.map(s => (
                <tr key={s.scan_id} className="hover:bg-[#141C33]">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.scan_id?.slice(0,8)}…</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{s.credential_label || s.credential_id?.slice(0,8) || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{(s.regions || []).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmt(s.started_at)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{duration(s.started_at, s.finished_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status] || 'bg-[#1A2340] text-slate-600'}`}>{s.status}</span>
                    {s.error && <p className="text-xs text-red-500 mt-1 max-w-xs truncate">{s.error}</p>}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 font-medium">{s.events_found ?? 0}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{s.actions_queued ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
