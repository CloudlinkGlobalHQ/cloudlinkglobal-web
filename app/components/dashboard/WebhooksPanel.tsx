'use client'

import { useEffect, useState } from 'react'
import { getWebhooks, addWebhook, deleteWebhook, testWebhooks } from '../../lib/api'

const ALL_EVENTS = ['action.created', 'action.completed', 'action.approved', 'action.rejected', 'scan.finished', 'ping']

export default function WebhooksPanel() {
  const [hooks, setHooks]     = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ url: '', secret: '', events: [...ALL_EVENTS] })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [busy, setBusy]       = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    try { const d = await getWebhooks(); setHooks(d.items || []) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleEvent = (ev: string) => {
    setForm(f => ({ ...f, events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev] }))
  }

  const handleAdd = async () => {
    setSaving(true); setMsg('')
    try {
      await addWebhook({ url: form.url, secret: form.secret || undefined, events: form.events })
      setForm({ url: '', secret: '', events: [...ALL_EVENTS] })
      setShowForm(false); setMsg('Webhook registered.'); load()
    } catch (e: any) { setMsg(`Error: ${e.message}`) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return
    setBusy(b => ({ ...b, [id]: true }))
    try { await deleteWebhook(id); load() } catch (e: any) { alert(e.message) }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const handleTest = async () => {
    try { await testWebhooks(); setMsg('Test ping sent to all webhooks.') } catch (e: any) { setMsg(`Error: ${e.message}`) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Webhooks</h1>
          <p className="text-slate-500 text-sm mt-1">Receive real-time Cloudlink events via HTTP POST</p>
        </div>
        <div className="flex gap-2">
          {hooks.length > 0 && <button onClick={handleTest} className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition">Send test ping</button>}
          <button onClick={() => setShowForm(s => !s)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">+ Add webhook</button>
        </div>
      </div>

      {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Register webhook</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">URL *</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://your-server.com/cloudlink-hook"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">HMAC Secret (optional)</label>
              <input value={form.secret} onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} type="password" placeholder="your-secret"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">Events to subscribe to</label>
            <div className="flex flex-wrap gap-2">
              {ALL_EVENTS.map(ev => (
                <label key={ev} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} className="rounded text-green-600" />
                  <span className="text-xs text-slate-700 font-mono">{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving || !form.url} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {saving ? 'Saving…' : 'Save webhook'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : hooks.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No webhooks yet. Add one above to receive real-time events.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['URL','Events','Last Fired','Last Status',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hooks.map((h: any) => (
                <tr key={h.webhook_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 max-w-xs truncate">{h.url}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(h.events || []).map((ev: string) => <span key={ev} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-mono">{ev}</span>)}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{h.last_fired_at ? new Date(h.last_fired_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    {h.last_status ? <span className={`px-2 py-0.5 rounded-full font-medium ${h.last_status?.startsWith('2') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{h.last_status}</span> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button disabled={busy[h.webhook_id]} onClick={() => handleDelete(h.webhook_id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg disabled:opacity-50 transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
