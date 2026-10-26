'use client'

import { useState } from 'react'
import { getWebhooks, addWebhook, deleteWebhook, testWebhooks, getSlackSettings, updateSlackSettings, testSlackSettings, toApiError } from '../../lib/api'
import { describeError } from '../../lib/errors'
import { useApi } from '../../lib/useApi'
import { EmptyState, ErrorState, LoadingState, PageHeader } from './states'

// Events the backend fires today in read-only mode.
const ALL_EVENTS = ['scan.finished', 'ping']

type Webhook = { webhook_id: string; url: string; events?: string[]; last_fired_at?: string; last_status?: string }
type Notice = { ok: boolean; text: string } | null

function errorText(e: unknown) {
  const d = describeError(toApiError(e))
  return d.hint ? `${d.title}. ${d.hint}` : `${d.title}. ${d.message}`
}

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null
  return <p role={notice.ok ? 'status' : 'alert'} className={`mt-3 text-xs ${notice.ok ? 'text-[#6EE7B7]' : 'text-red-400'}`}>{notice.text}</p>
}

function SlackForm({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl)
  const [saved, setSaved] = useState(initialUrl)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const handleSave = async () => {
    setSaving(true); setNotice(null)
    try {
      await updateSlackSettings({ slack_webhook_url: url, enabled: true })
      setSaved(url)
      setNotice({ ok: true, text: 'Slack webhook saved.' })
    } catch (e) { setNotice({ ok: false, text: errorText(e) }) }
    setSaving(false)
  }

  const handleTest = async () => {
    setTesting(true); setNotice(null)
    try { await testSlackSettings(); setNotice({ ok: true, text: 'Test message sent. Check your Slack channel.' }) }
    catch (e) { setNotice({ ok: false, text: errorText(e) }) }
    setTesting(false)
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="slack-url" className="mb-1 block text-xs font-medium text-slate-400">Slack incoming webhook URL</label>
          <input
            id="slack-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
            className="dashboard-field w-full rounded-lg px-3 py-2 font-mono text-sm"
          />
        </div>
        <button type="button" onClick={handleSave} disabled={saving || url === saved} className="dashboard-primary-button whitespace-nowrap px-4 py-2 text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && (
          <button type="button" onClick={handleTest} disabled={testing} className="dashboard-secondary-button whitespace-nowrap px-4 py-2 text-sm disabled:opacity-50">
            {testing ? 'Sending…' : 'Send test message'}
          </button>
        )}
      </div>
      <NoticeLine notice={notice} />
    </>
  )
}

function SlackCard() {
  const { data, error, loading, retry } = useApi<{ slack_webhook_url?: string }>(getSlackSettings)
  return (
    <section className="mb-6 rounded-xl border border-[#1E2D4F] bg-[#0F1629] p-6" aria-labelledby="slack-title">
      <h2 id="slack-title" className="font-semibold text-slate-100">Slack</h2>
      <p className="mb-4 text-xs text-slate-400">
        Save a Slack incoming webhook and send a test message. Automatic regression and budget alerts are coming soon.
      </p>
      {loading && !data ? <LoadingState label="Loading Slack settings…" />
        : error && !data ? <ErrorState error={error} onRetry={retry} compact />
        : <SlackForm key={data?.slack_webhook_url || ''} initialUrl={data?.slack_webhook_url || ''} />}
    </section>
  )
}

export default function WebhooksPanel() {
  const { data, error, loading, retry } = useApi(async () => {
    const d = await getWebhooks()
    return (Array.isArray(d?.items) ? d.items : []) as Webhook[]
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ url: '', secret: '', events: [...ALL_EVENTS] })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const hooks = data || []

  const toggleEvent = (ev: string) => {
    setForm((f) => ({ ...f, events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev] }))
  }

  const handleAdd = async () => {
    setSaving(true); setNotice(null)
    try {
      await addWebhook({ url: form.url, secret: form.secret || undefined, events: form.events })
      setForm({ url: '', secret: '', events: [...ALL_EVENTS] })
      setShowForm(false); setNotice({ ok: true, text: 'Webhook added.' }); retry()
    } catch (e) { setNotice({ ok: false, text: errorText(e) }) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return
    setBusy((b) => ({ ...b, [id]: true })); setNotice(null)
    try { await deleteWebhook(id); retry() } catch (e) { setNotice({ ok: false, text: errorText(e) }) }
    setBusy((b) => ({ ...b, [id]: false }))
  }

  const handleTest = async () => {
    setNotice(null)
    try { await testWebhooks(); setNotice({ ok: true, text: 'Test ping sent to all webhooks.' }) } catch (e) { setNotice({ ok: false, text: errorText(e) }) }
  }

  return (
    <div>
      <PageHeader
        title="Webhooks & Slack"
        subtitle="Get Cloudlink events by HTTP POST or in Slack"
        actions={
          <>
            {hooks.length > 0 && <button type="button" onClick={handleTest} className="dashboard-secondary-button px-4 py-2 text-sm">Send test ping</button>}
            <button type="button" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm} className="dashboard-primary-button px-4 py-2 text-sm">+ Add webhook</button>
          </>
        }
      />

      <SlackCard />

      <NoticeLine notice={notice} />

      {showForm && (
        <div className="my-6 rounded-xl border border-[#1E2D4F] bg-[#0F1629] p-6">
          <h2 className="mb-4 font-semibold text-slate-100">Add a webhook</h2>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="hook-url" className="mb-1 block text-xs font-medium text-slate-400">URL *</label>
              <input id="hook-url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://your-server.example/cloudlink-hook" className="dashboard-field w-full rounded-lg px-3 py-2 font-mono text-sm" />
            </div>
            <div>
              <label htmlFor="hook-secret" className="mb-1 block text-xs font-medium text-slate-400">HMAC secret (optional)</label>
              <input id="hook-secret" value={form.secret} onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))} type="password" autoComplete="off" className="dashboard-field w-full rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <fieldset className="mb-4">
            <legend className="mb-2 block text-xs font-medium text-slate-400">Events</legend>
            <div className="flex flex-wrap gap-3">
              {ALL_EVENTS.map((ev) => (
                <label key={ev} className="flex cursor-pointer items-center gap-1.5">
                  <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} className="rounded" />
                  <span className="font-mono text-xs text-slate-300">{ev}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-3">
            <button type="button" onClick={handleAdd} disabled={saving || !form.url} className="dashboard-primary-button px-4 py-2 text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save webhook'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="dashboard-secondary-button px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        {loading && !data ? <LoadingState label="Loading webhooks…" />
          : error && !data ? <ErrorState error={error} onRetry={retry} />
          : hooks.length === 0 ? <EmptyState title="No webhooks yet" body="Add a webhook to get a POST request when a scan finishes." />
          : (
            <div className="overflow-x-auto rounded-xl border border-[#1E2D4F] bg-[#0F1629]">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
                  <tr>{['URL', 'Events', 'Last fired', 'Last status', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4F]">
                  {hooks.map((h) => (
                    <tr key={h.webhook_id} className="hover:bg-[#141C33]">
                      <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-300">{h.url}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(h.events || []).map((ev) => <span key={ev} className="rounded bg-[#10B981]/15 px-1.5 py-0.5 font-mono text-xs text-[#10B981]">{ev}</span>)}</div></td>
                      <td className="px-4 py-3 text-xs text-slate-400">{h.last_fired_at ? new Date(h.last_fired_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{h.last_status || '—'}</td>
                      <td className="px-4 py-3">
                        <button type="button" disabled={busy[h.webhook_id]} onClick={() => handleDelete(h.webhook_id)} aria-label={`Delete webhook ${h.url}`} className="rounded-lg bg-red-500/15 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/25 disabled:opacity-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
