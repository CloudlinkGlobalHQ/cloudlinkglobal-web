'use client'

import { getScans } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { useScan } from '../../lib/scan'
import { EmptyState, ErrorState, LoadingState, PageHeader } from './states'

const STATUS_STYLES: Record<string, string> = {
  finished: 'bg-[#10B981]/12 text-[#6EE7B7] border-[#10B981]/20',
  running:  'bg-blue-500/12 text-blue-300 border-blue-500/20',
  error:    'bg-red-500/12 text-red-300 border-red-500/20',
}

type Scan = {
  scan_id: string
  credential_id?: string
  credential_label?: string
  regions?: string[]
  started_at?: string
  finished_at?: string
  status?: string
  error?: string | null
  events_found?: number
}

function fmt(iso?: string | null) { return iso ? new Date(iso).toLocaleString() : '—' }
function duration(start?: string, end?: string) {
  if (!start || !end) return '—'
  const s = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function ScansHistory() {
  const { data, error, loading, retry } = useApi(async () => {
    const d = await getScans()
    return (Array.isArray(d?.items) ? d.items : []) as Scan[]
  })
  const scan = useScan()
  const running = scan.status === 'running'

  const header = (
    <PageHeader
      title="Scan History"
      subtitle="Every time Cloudlink scanned your AWS account"
      actions={
        <>
          <button type="button" onClick={() => { void scan.start() }} disabled={running} aria-busy={running} className="dashboard-primary-button px-4 py-2 text-sm disabled:opacity-50">
            {running ? 'Scanning…' : 'Scan now'}
          </button>
          <button type="button" onClick={retry} disabled={loading} className="dashboard-secondary-button px-3 py-2 text-sm disabled:opacity-50">Refresh</button>
        </>
      }
    />
  )

  if (loading && !data) return <>{header}<LoadingState label="Loading scan history…" /></>
  if (error && !data) return <>{header}<ErrorState error={error} onRetry={retry} /></>
  const scans = data || []
  if (scans.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="No scans yet"
          body="Connect your AWS account, then click Scan now."
          action={{ label: 'Connect AWS', href: '/dashboard/credentials' }}
        />
      </>
    )
  }

  return (
    <div>
      {header}
      {error && <div className="mb-4"><ErrorState error={error} onRetry={retry} compact /></div>}
      <div className="overflow-x-auto rounded-xl border border-[#1E2D4F] bg-[#0F1629]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
            <tr>{['Account', 'Regions', 'Started', 'Duration', 'Status', 'Items found'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#1E2D4F]">
            {scans.map((s) => (
              <tr key={s.scan_id} className="hover:bg-[#141C33]">
                <td className="px-4 py-3 font-medium text-slate-200">{s.credential_label || s.credential_id?.slice(0, 8) || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{(s.regions || []).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmt(s.started_at)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{duration(s.started_at, s.finished_at)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status || ''] || 'border-[#1E2D4F] bg-[#1A2340] text-slate-400'}`}>{s.status || 'unknown'}</span>
                  {s.error && <p className="mt-1 max-w-xs truncate text-xs text-red-400" title={s.error}>{s.error}</p>}
                </td>
                <td className="px-4 py-3 text-slate-200">{s.events_found ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
