'use client'

import { useEffect, useState } from 'react'
import { getWebhooks, addWebhook, deleteWebhook, testWebhooks, getSlackSettings, updateSlackSettings, testSlackSettings } from '../../lib/api'

const ALL_EVENTS = ['action.created', 'action.completed', 'action.approved', 'action.rejected', 'scan.finished', 'ping', 'regression.detected']

function SlackCard() {
  const [url, setUrl]         = useState('')
  const [saved, setSaved]     = useState('')
  const [enabled, setEnabled] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [testing, setTesting] = useState(false)
  const [msg, setMsg]         = useState('')
  const [msgOk, setMsgOk]     = useState(true)

  useEffect(() => {
    getSlackSettings().then((d: any) => {
      setUrl(d.slack_webhook_url || '')
      setSaved(d.slack_webhook_url || '')
      setEnabled(d.enabled ?? true)
    }).catch((e: any) => { setMsg(`Error loading Slack settings: ${e?.message || 'Something went wrong'}`); setMsgOk(false) })
  }, [])

  const flash = (text: string, ok = true) => { setMsg(text); setMsgOk(ok); setTimeout(() => setMsg(''), 4000) }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSlackSettings({ slack_webhook_url: url, enabled })
      setSaved(url)
      flash('Slack webhook saved.')
    } catch (e: any) { flash(`Error: ${e.message}`, false) }
    setSaving(false)
  }

  const handleTest = async () => {
    if (!saved) { flash('Save a webhook URL first.', false); return }
    setTesting(true)
    try { await testSlackSettings(); flash('Test alert sent — check your Slack channel!') }
    catch (e: any) { flash(`Error: ${e.message}`, false) }
    setTesting(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4A154B] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
              <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
              <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
              <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.249m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Slack Alerts</h2>
            <p className="text-xs text-slate-500">Get notified in Slack when a cost regression is detected</p>
          </div>
        </div>
        {saved && (
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">Connected</span>
        )}
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Slack Incoming Webhook URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/T.../B.../..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button onClick={handleSave} disabled={saving || url === saved}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && (
          <button onClick={handleTest} disabled={testing}
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap">
            {testing ? 'Sending…' : 'Test alert'}
          </button>
        )}
      </div>

      {msg && <p className={`text-xs mt-3 ${msgOk ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}

      <p className="text-xs text-slate-400 mt-3">
        Create an incoming webhook at <span className="font-mono">api.slack.com/apps</span> → Incoming Webhooks, then paste the URL above.
      </p>
    </div>
  )
}

export default function WebhooksPanel() {
  const [hooks, setHooks]     = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ url: '', secret: '', events: [...ALL_EVENTS] })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [busy, setBusy]       = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    setError('')
    try { const d = await getWebhooks(); setHooks(d.items || []) } catch (e: any) { setError(e?.message || 'Something went wrong') }
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
          <h1 className="text-2xl font-bold text-slate-800">Webhooks & Integrations</h1>
          <p className="text-slate-500 text-sm mt-1">Receive real-time Cloudlink events via HTTP POST or Slack</p>
        </div>
        <div className="flex gap-2">
          {hooks.length > 0 && <button onClick={handleTest} className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition">Send test ping</button>}
          <button onClick={() => setShowForm(s => !s)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">+ Add webhook</button>
        </div>
      </div>

      <SlackCard />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
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
