'use client'

import { useEffect, useState } from 'react'
import { getActions, approveAction, rejectAction, retryAction, getApprovalPolicies, setApprovalPolicy } from '../../lib/api'

const STATUS_COLORS: Record<string, string> = {
  SUCCESS:           'bg-green-100 text-green-700',
  PENDING:           'bg-blue-100 text-blue-700',
  AWAITING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  FAILED:            'bg-red-100 text-red-700',
  RETRY:             'bg-orange-100 text-orange-700',
  IN_PROGRESS:       'bg-purple-100 text-purple-700',
}

const FILTERS = ['All', 'AWAITING_APPROVAL', 'PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'RETRY']
const ACTION_TYPES = ['close_open_ssh', 'close_open_rdp', 'stop_idle_ec2', 'review_high_cost']

export default function ActionsTable({ onRefresh }: { onRefresh?: () => void }) {
  const [actions, setActions]   = useState<any[]>([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showPolicies, setShowPolicies] = useState(false)
  const [policies, setPolicies] = useState<Record<string, any>>({})
  const [savingPolicy, setSavingPolicy] = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getActions(filter === 'All' ? '' : filter)
      setActions(data.items || [])
    } catch (e: any) { setError(e?.message || 'Something went wrong') }
    setLoading(false)
  }

  const loadPolicies = async () => {
    setError('')
    try {
      const d = await getApprovalPolicies()
      const map: Record<string, any> = {}
      for (const p of d.items || []) map[p.action_type] = p
      setPolicies(map)
    } catch (e: any) { setError(e?.message || 'Something went wrong') }
  }

  useEffect(() => { load() }, [filter])
  useEffect(() => { if (showPolicies) loadPolicies() }, [showPolicies])

  const act = async (fn: (id: string) => Promise<any>, id: string) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await fn(id); await load(); onRefresh?.() } catch (e: any) { alert(e.message) }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const togglePolicy = async (actionType: string, current: boolean) => {
    setSavingPolicy(s => ({ ...s, [actionType]: true }))
    try {
      await setApprovalPolicy(actionType, { require_approval: !current })
      await loadPolicies()
    } catch (e: any) { alert(e.message) }
    setSavingPolicy(s => ({ ...s, [actionType]: false }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Actions</h1>
          <p className="text-slate-500 text-sm mt-1">AI-generated remediation actions for your cloud resources</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPolicies(s => !s)}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition">
            ⚙ Policies
          </button>
          <button onClick={load} className="text-sm text-green-600 hover:underline">↻ Refresh</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {showPolicies && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-1">Approval policies</h2>
          <p className="text-xs text-slate-500 mb-4">Toggle whether each action type requires manual approval before executing.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACTION_TYPES.map(type => {
              const pol = policies[type]
              const requiresApproval = pol ? pol.require_approval : true
              return (
                <div key={type} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-400">{requiresApproval ? 'Requires approval' : 'Auto-execute'}</p>
                  </div>
                  <button
                    disabled={savingPolicy[type]}
                    onClick={() => togglePolicy(type, requiresApproval)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${requiresApproval ? 'bg-green-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${requiresApproval ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-300'}`}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : actions.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No actions found for this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Action', 'Resource', 'Reason', 'Conf.', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map(a => {
                const isApproval = a.status === 'AWAITING_APPROVAL'
                const isFailed   = ['FAILED', 'RETRY'].includes(a.status)
                const isOpen     = expanded === a.action_id
                return (
                  <>
                    <tr key={a.action_id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(isOpen ? null : a.action_id)}>
                      <td className="px-4 py-3"><span className="font-medium text-slate-800">{a.action_type?.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 max-w-xs"><span className="truncate block">{a.resource_id}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs"><span className="truncate block">{a.reason || '—'}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.confidence != null ? `${Math.round(a.confidence * 100)}%` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                          {a.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-end">
                          {isApproval && (
                            <>
                              <button disabled={busy[a.action_id]} onClick={e => { e.stopPropagation(); act(approveAction, a.action_id) }}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg disabled:opacity-50 transition">Approve</button>
                              <button disabled={busy[a.action_id]} onClick={e => { e.stopPropagation(); act(rejectAction, a.action_id) }}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg disabled:opacity-50 transition">Reject</button>
                            </>
                          )}
                          {isFailed && (
                            <button disabled={busy[a.action_id]} onClick={e => { e.stopPropagation(); act(retryAction, a.action_id) }}
                              className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs rounded-lg disabled:opacity-50 transition">Retry</button>
                          )}
                          <span className="text-slate-300 text-xs self-center">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${a.action_id}-detail`} className="bg-slate-50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                            <div><span className="text-slate-400 block">Action ID</span><span className="font-mono">{a.action_id}</span></div>
                            <div><span className="text-slate-400 block">Attempts</span><span>{a.attempt_count ?? 0}</span></div>
                            {a.last_error && <div className="md:col-span-2"><span className="text-slate-400 block">Last error</span><span className="text-red-600">{a.last_error}</span></div>}
                            {a.proposed_change && Object.keys(a.proposed_change).length > 0 && (
                              <div className="md:col-span-4">
                                <span className="text-slate-400 block mb-1">Proposed change</span>
                                <pre className="bg-white border border-slate-200 rounded p-2 text-xs overflow-auto">{JSON.stringify(a.proposed_change, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
