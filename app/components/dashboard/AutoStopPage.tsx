/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAutostopRules,
  createAutostopRule,
  updateAutostopRule,
  deleteAutostopRule,
  getAutostopEvents,
  getAutostopSavings,
  runAutostopNow,
  getResources,
  stopResource,
  startResource,
} from '../../lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

interface AutostopRule {
  rule_id: string
  name: string
  enabled: boolean
  environment_tag: string
  resource_types: string[]
  idle_threshold_pct: number
  idle_lookback_hours: number
  schedule_stop: string | null
  schedule_start: string | null
  created_at: string
}

interface AutostopEvent {
  event_id: string
  resource_id: string
  resource_type: string
  action: 'stopped' | 'started' | 'failed'
  reason: string | null
  savings_usd_est: number | null
  region: string | null
  created_at: string
  rule_id: string | null
}

interface Savings {
  total_stopped: number
  total_started: number
  total_savings_usd: number
}

interface IdleResource {
  resource_id: string
  resource_type: string
  region: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function Badge({ label, color }: { label: string; color: string }) {
  const cls: Record<string, string> = {
    green:  'bg-green-50 text-green-700 ring-green-200',
    red:    'bg-red-50 text-red-700 ring-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    slate:  'bg-slate-100 text-slate-600 ring-slate-200',
    blue:   'bg-blue-50 text-blue-700 ring-blue-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls[color] || cls.slate}`}>
      {label}
    </span>
  )
}

// ── Rule Form Modal ───────────────────────────────────────────────────────────

const BLANK_RULE = {
  name: '',
  environment_tag: '*',
  resource_types: ['ec2_instance'],
  idle_threshold_pct: 5,
  idle_lookback_hours: 24,
  schedule_stop: '',
  schedule_start: '',
  enabled: true,
}

function RuleModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AutostopRule | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<any>(initial ? {
    name: initial.name,
    environment_tag: initial.environment_tag,
    resource_types: initial.resource_types,
    idle_threshold_pct: initial.idle_threshold_pct,
    idle_lookback_hours: initial.idle_lookback_hours,
    schedule_stop: initial.schedule_stop || '',
    schedule_start: initial.schedule_start || '',
    enabled: initial.enabled,
  } : BLANK_RULE)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return }
    setSaving(true); setErr('')
    try {
      await onSave({
        ...form,
        schedule_stop: form.schedule_stop || null,
        schedule_start: form.schedule_start || null,
        idle_threshold_pct: Number(form.idle_threshold_pct),
        idle_lookback_hours: Number(form.idle_lookback_hours),
      })
      onClose()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">
          {initial ? 'Edit rule' : 'New AutoStop rule'}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Rule name</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              placeholder="Stop idle dev instances"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Environment tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Environment tag <span className="text-slate-400 font-normal">(AWS "Environment" tag value, or * for all)</span>
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              placeholder="dev, staging, or *"
              value={form.environment_tag}
              onChange={e => set('environment_tag', e.target.value)}
            />
          </div>

          {/* Idle threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Idle CPU threshold (%)
              </label>
              <input
                type="number" min={0} max={100} step={0.5}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.idle_threshold_pct}
                onChange={e => set('idle_threshold_pct', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Lookback window (hours)
              </label>
              <input
                type="number" min={1} max={168}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.idle_lookback_hours}
                onChange={e => set('idle_lookback_hours', e.target.value)}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Stop at (UTC HH:MM) <span className="text-slate-400 font-normal">or blank for idle-only</span>
              </label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.schedule_stop || ''}
                onChange={e => set('schedule_stop', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Restart at (UTC HH:MM) <span className="text-slate-400 font-normal">optional</span>
              </label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.schedule_start || ''}
                onChange={e => set('schedule_start', e.target.value)}
              />
            </div>
          </div>

          {/* Enabled toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('enabled', !form.enabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enabled ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-slate-700">Rule enabled</span>
          </label>
        </div>

        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition">Cancel</button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save rule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AutoStopPage() {
  const [rules, setRules]       = useState<AutostopRule[]>([])
  const [events, setEvents]     = useState<AutostopEvent[]>([])
  const [savings, setSavings]   = useState<Savings | null>(null)
  const [idleResources, setIdleResources] = useState<IdleResource[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<'create' | AutostopRule | null>(null)
  const [runState, setRunState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [actionStates, setActionStates] = useState<Record<string, 'stopping' | 'starting'>>({})

  const refresh = useCallback(async () => {
    try {
      const [r, e, s, res] = await Promise.all([
        getAutostopRules(),
        getAutostopEvents(50),
        getAutostopSavings(),
        getResources(),
      ])
      setRules(r)
      setEvents(e)
      setSavings(s)
      // Filter idle EC2 instances from resources
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const idle = (Array.isArray(res) ? res : res.resources || []).filter((r: any) => {
        const p = r.payload || {}
        return r.resource_type === 'ec2_instance' && (p.is_idle || (p.avg_cpu_7d !== null && p.avg_cpu_7d < 10))
      })
      setIdleResources(idle)
    } catch {}
    setLoading(false)
  }, [])

   
  useEffect(() => { refresh() }, [refresh])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveRule = async (data: any) => {
    if (modal && modal !== 'create') {
      await updateAutostopRule((modal as AutostopRule).rule_id, data)
    } else {
      await createAutostopRule(data)
    }
    refresh()
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Delete this rule?')) return
    await deleteAutostopRule(ruleId)
    refresh()
  }

  const handleToggle = async (rule: AutostopRule) => {
    await updateAutostopRule(rule.rule_id, { enabled: !rule.enabled })
    refresh()
  }

  const handleRunNow = async () => {
    setRunState('running')
    try {
      await runAutostopNow()
      setRunState('done')
      refresh()
    } catch {
      setRunState('error')
    }
    setTimeout(() => setRunState('idle'), 4000)
  }

  const handleStop = async (resource: IdleResource) => {
    const id = resource.resource_id
    setActionStates(s => ({ ...s, [id]: 'stopping' }))
    try {
      const p = resource.payload || {}
      await stopResource(id, { region: resource.region || p.region || 'us-east-1', role_arn: p.role_arn })
      refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionStates(s => { const n = { ...s }; delete n[id]; return n })
    }
  }

  const handleStart = async (resource: IdleResource) => {
    const id = resource.resource_id
    setActionStates(s => ({ ...s, [id]: 'starting' }))
    try {
      const p = resource.payload || {}
      await startResource(id, { region: resource.region || p.region || 'us-east-1', role_arn: p.role_arn })
      refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionStates(s => { const n = { ...s }; delete n[id]; return n })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const runLabel = { idle: '▶ Run now', running: '⟳ Running…', done: '✓ Done', error: '✕ Error' }[runState]
  const totalSavings = savings?.total_savings_usd ?? 0
  const monthlySavings = totalSavings * 24 * 30

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AutoStopping</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automatically stop idle non-prod resources. Save 70–90% on dev/staging costs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunNow}
            disabled={runState === 'running'}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition disabled:opacity-60 shadow-sm ${
              runState === 'done' ? 'bg-green-600' : runState === 'error' ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {runLabel}
          </button>
          <button
            onClick={() => setModal('create')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            + New rule
          </button>
        </div>
      </div>

      {/* Savings stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Idle resources', value: idleResources.length, color: 'text-yellow-600', sub: 'detected now' },
          { label: 'Resources stopped', value: savings?.total_stopped ?? 0, color: 'text-green-600', sub: 'total autostops' },
          { label: 'Est. hourly savings', value: `$${totalSavings.toFixed(2)}`, color: 'text-green-700', sub: 'from stopped resources' },
          { label: 'Est. monthly savings', value: `$${monthlySavings.toFixed(0)}`, color: 'text-green-700', sub: 'if sustained' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">AutoStop rules</h2>
          <span className="text-xs text-slate-400">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
        </div>
        {rules.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-400 text-sm mb-3">No rules yet. Create one to start saving.</p>
            <button
              onClick={() => setModal('create')}
              className="text-green-600 hover:underline text-sm font-medium"
            >
              + Create your first rule
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Environment</th>
                <th className="px-5 py-3 text-left">Trigger</th>
                <th className="px-5 py-3 text-left">Schedule</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map(rule => (
                <tr key={rule.rule_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{rule.name}</td>
                  <td className="px-5 py-3">
                    <Badge
                      label={rule.environment_tag === '*' ? 'All envs' : rule.environment_tag}
                      color={rule.environment_tag === 'prod' || rule.environment_tag === 'production' ? 'red' : 'blue'}
                    />
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    CPU &lt; {rule.idle_threshold_pct}% over {rule.idle_lookback_hours}h
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {rule.schedule_stop
                      ? `Stop ${rule.schedule_stop} UTC${rule.schedule_start ? ` · Start ${rule.schedule_start} UTC` : ''}`
                      : 'On idle detection'}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleToggle(rule)}>
                      <Badge label={rule.enabled ? 'Enabled' : 'Disabled'} color={rule.enabled ? 'green' : 'slate'} />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModal(rule)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.rule_id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Idle resources */}
      {idleResources.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Idle resources</h2>
              <p className="text-xs text-slate-400 mt-0.5">These resources are idle now and can be stopped</p>
            </div>
            <Badge label={`${idleResources.length} idle`} color="yellow" />
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Resource</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Region</th>
                <th className="px-5 py-3 text-left">Avg CPU (7d)</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {idleResources.map(r => {
                const p = r.payload || {}
                const state = actionStates[r.resource_id]
                return (
                  <tr key={r.resource_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs text-slate-700">{r.resource_id}</div>
                      {p.name && p.name !== r.resource_id && (
                        <div className="text-xs text-slate-400">{p.name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={r.resource_type.replace('_', ' ')} color="slate" />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{r.region || p.region || '—'}</td>
                    <td className="px-5 py-3">
                      {p.avg_cpu_7d !== null && p.avg_cpu_7d !== undefined ? (
                        <span className="text-yellow-600 font-medium">{p.avg_cpu_7d}%</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStop(r)}
                          disabled={!!state}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60"
                        >
                          {state === 'stopping' ? '⟳ Stopping…' : '⏹ Stop'}
                        </button>
                        <button
                          onClick={() => handleStart(r)}
                          disabled={!!state}
                          className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-60"
                        >
                          {state === 'starting' ? '⟳ Starting…' : '▶ Start'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Event log */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">AutoStop history</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 50 stop/start events</p>
        </div>
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No events yet — run an evaluation to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Resource</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Savings est.</th>
                <th className="px-5 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map(ev => (
                <tr key={ev.event_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{ev.resource_id}</td>
                  <td className="px-5 py-3">
                    <Badge
                      label={ev.action}
                      color={ev.action === 'stopped' ? 'yellow' : ev.action === 'started' ? 'green' : 'red'}
                    />
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs max-w-xs truncate">{ev.reason || '—'}</td>
                  <td className="px-5 py-3 text-green-600 font-medium">
                    {ev.savings_usd_est != null ? `$${ev.savings_usd_est.toFixed(3)}/hr` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{fmt(ev.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rule modal */}
      {modal !== null && (
        <RuleModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSaveRule}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
