'use client'

import { useState, useEffect, useCallback } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...((opts as any).headers || {}) },
    ...opts,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

interface Rule { field: string; op: string; value: string }
interface VirtualTag {
  tag_id: string
  name: string
  color: string
  rules: Rule[]
  created_at: string
}
interface TagBreakdown {
  tag: string; color: string; total_usd: number; pct: number
}
interface BreakdownData {
  total_usd: number
  period_days: number
  breakdown: TagBreakdown[]
  tags_defined: number
  snapshots_analyzed: number
}

const FIELDS = ['service', 'resource_type', 'region', 'account_id']
const OPS    = ['contains', 'equals', 'starts_with', 'ends_with', 'not_contains']
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6', '#f97316', '#06b6d4']

function RulePill({ rule, onRemove }: { rule: Rule; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-mono">
      {rule.field} {rule.op} "{rule.value}"
      <button onClick={onRemove} className="ml-0.5 text-slate-400 hover:text-red-500">×</button>
    </span>
  )
}

export default function VirtualTagsPage() {
  const [tags, setTags]           = useState<VirtualTag[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [days, setDays]           = useState(30)
  const [showCreate, setShowCreate] = useState(false)
  const [editTag, setEditTag]     = useState<VirtualTag | null>(null)

  // Create form state
  const [name, setName]   = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [rules, setRules] = useState<Rule[]>([])
  const [ruleField, setRuleField] = useState('service')
  const [ruleOp, setRuleOp]       = useState('contains')
  const [ruleValue, setRuleValue] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, b] = await Promise.all([
        apiFetch('/virtual-tags'),
        apiFetch(`/virtual-tags/costs/breakdown?days=${days}`),
      ])
      setTags(Array.isArray(t) ? t : [])
      setBreakdown(b)
    } catch {}
    finally { setLoading(false) }
  }, [days])

  useEffect(() => { load() }, [load])

  const addRule = () => {
    if (!ruleValue.trim()) return
    setRules(r => [...r, { field: ruleField, op: ruleOp, value: ruleValue.trim() }])
    setRuleValue('')
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editTag) {
        await apiFetch(`/virtual-tags/${editTag.tag_id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, color, rules }),
        })
      } else {
        await apiFetch('/virtual-tags', {
          method: 'POST',
          body: JSON.stringify({ name, color, rules }),
        })
      }
      setShowCreate(false); setEditTag(null)
      setName(''); setColor(COLORS[0]); setRules([])
      load()
    } catch {}
    finally { setSaving(false) }
  }

  const handleDelete = async (tag_id: string) => {
    if (!confirm('Delete this virtual tag?')) return
    await apiFetch(`/virtual-tags/${tag_id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (tag: VirtualTag) => {
    setEditTag(tag); setName(tag.name); setColor(tag.color); setRules(tag.rules)
    setShowCreate(true)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  )

  const total = breakdown?.total_usd || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Virtual Tags</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Retroactively allocate cloud costs without changing AWS tags — group services into logical categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${days === d ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={() => { setShowCreate(true); setEditTag(null); setName(''); setColor(COLORS[0]); setRules([]) }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
            + New Tag
          </button>
        </div>
      </div>

      {/* Cost breakdown */}
      {breakdown && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Cost by Virtual Tag</h2>
            <span className="text-sm text-slate-500">{days}-day total: <strong className="text-slate-900">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          </div>

          {/* Stacked bar */}
          {total > 0 && (
            <div className="flex h-6 rounded-full overflow-hidden mb-4">
              {breakdown.breakdown.filter(b => b.total_usd > 0).map(b => (
                <div
                  key={b.tag}
                  style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  title={`${b.tag}: $${b.total_usd.toFixed(2)} (${b.pct}%)`}
                  className="transition-all"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {breakdown.breakdown.map(b => (
              <div key={b.tag} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 truncate">{b.tag}</span>
                    <span className="text-sm font-bold text-slate-900 ml-2">${b.total_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{b.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {breakdown.tags_defined === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">
              Create virtual tags above to start allocating costs into categories.
            </div>
          )}
        </div>
      )}

      {/* Tag list */}
      {tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Defined Tags ({tags.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {tags.map(tag => (
              <div key={tag.tag_id} className="flex items-start gap-4 px-6 py-4">
                <div className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ backgroundColor: tag.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{tag.name}</span>
                    <span className="text-xs text-slate-400">{tag.rules.length} rule{tag.rules.length !== 1 ? 's' : ''}</span>
                  </div>
                  {tag.rules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tag.rules.map((r, i) => (
                        <span key={i} className="inline-flex items-center bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono">
                          {r.field} {r.op} "{r.value}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(tag)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button onClick={() => handleDelete(tag.tag_id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editTag ? 'Edit' : 'Create'} Virtual Tag</h3>
              <button onClick={() => { setShowCreate(false); setEditTag(null) }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g. Production, Data Platform, Marketing" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Matching Rules <span className="text-slate-400 font-normal">(all rules must match)</span></label>
                <div className="flex gap-2 mb-2">
                  <select value={ruleField} onChange={e => setRuleField(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    {FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select value={ruleOp} onChange={e => setRuleOp(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    {OPS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <input value={ruleValue} onChange={e => setRuleValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addRule()}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="value…" />
                  <button onClick={addRule} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition">+ Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rules.map((r, i) => (
                    <RulePill key={i} rule={r} onRemove={() => setRules(rules.filter((_, j) => j !== i))} />
                  ))}
                  {rules.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No rules yet — all untagged costs will go to "Untagged"</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setShowCreate(false); setEditTag(null) }}
                className="text-slate-600 hover:text-slate-800 px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                {saving ? 'Saving…' : editTag ? 'Save Changes' : 'Create Tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
