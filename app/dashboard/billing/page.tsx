'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSubscription } from '../../components/SubscriptionProvider'

interface SavingsSummary {
  savings_this_month_usd: number
  cloudlink_fee_this_month_usd: number
  savings_all_time_usd: number
  cloudlink_fee_all_time_usd: number
  billing_threshold_usd: number
  pending_billing: boolean
  rollover_usd: number
  breakdown: Record<string, number>
  events?: SavingsEvent[]
}

interface SavingsEvent {
  id: string
  resource_id: string
  saving_type: string
  amount_saved_usd: number
  description: string
  timestamp: string
  billed: boolean
  disputed?: boolean
}

interface Dispute {
  id: string
  saving_event_id: string
  reason: string
  status: string
  created_at: string
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

const SAVING_TYPE_LABELS: Record<string, string> = {
  AUTOSTOP: 'AutoStopping',
  IDLE_RESOURCE: 'Idle Resource',
  REGRESSION_PREVENTION: 'Regression Prevention',
  MISCONFIGURATION_FIX: 'Misconfiguration Fix',
}

// ── Dispute modal ─────────────────────────────────────────────────────────────
function DisputeModal({ event, onClose, onSubmit }: {
  event: SavingsEvent
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    await onSubmit(reason.trim())
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Dispute this saving</h3>
        <p className="text-xs text-slate-500 mb-4">
          Disputed savings are excluded from your invoice and flagged for manual review.
          Our team will reach out within 2 business days.
        </p>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Type</span>
            <span className="font-medium">{SAVING_TYPE_LABELS[event.saving_type] || event.saving_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Resource</span>
            <span className="font-medium font-mono truncate max-w-[200px]">{event.resource_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount</span>
            <span className="font-medium text-green-600">{fmt(event.amount_saved_usd)}</span>
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-700 mb-1.5">Reason for dispute</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. This resource was not actually idle — it was serving traffic from a secondary region."
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            {submitting ? 'Submitting…' : 'Submit dispute'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main billing page ─────────────────────────────────────────────────────────
export default function BillingPage() {
  const { subscription } = useSubscription()

  const [summary, setSummary] = useState<SavingsSummary | null>(null)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [disputeEvent, setDisputeEvent] = useState<SavingsEvent | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [sumRes, dispRes] = await Promise.allSettled([
        fetch('/api/savings/summary'),
        fetch('/api/savings/disputes'),
      ])
      if (sumRes.status === 'fulfilled' && sumRes.value.ok) setSummary(await sumRes.value.json())
      if (dispRes.status === 'fulfilled' && dispRes.value.ok) {
        const d = await dispRes.value.json()
        setDisputes(d.disputes || [])
      }
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Check if returning from successful setup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('setup=success')) {
      showToast('Payment method saved. You\'re all set.')
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [])

  const openPortal = async () => {
    if (!subscription?.stripe_customer_id) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Could not open billing portal')
    } catch (e: any) {
      showToast(e.message || 'Could not open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const openSetup = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/stripe/setup-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Could not open payment setup')
    } catch (e: any) {
      showToast(e.message || 'Could not open payment setup')
    } finally {
      setSetupLoading(false)
    }
  }

  const submitDispute = async (reason: string) => {
    if (!disputeEvent) return
    try {
      const res = await fetch('/api/savings/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saving_event_id: disputeEvent.id, reason }),
      })
      if (!res.ok) throw new Error('Failed to submit dispute')
      showToast('Dispute submitted. We\'ll review within 2 business days.')
      setDisputeEvent(null)
      await loadData()
    } catch (e: any) {
      showToast(e.message || 'Could not submit dispute')
    }
  }

  const hasPaymentMethod = !!subscription?.stripe_customer_id

  const events = summary?.events || []
  const disputedEventIds = new Set(disputes.map(d => d.saving_event_id))

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {disputeEvent && (
        <DisputeModal
          event={disputeEvent}
          onClose={() => setDisputeEvent(null)}
          onSubmit={submitDispute}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Performance billing — 15% of verified savings. Nothing until we save you money.
        </p>
      </div>

      {/* ── How it works banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-5">
        <div className="flex flex-wrap gap-6">
          {[
            { step: '1', label: 'Connect your cloud', desc: 'We scan for waste' },
            { step: '2', label: 'We find & fix waste', desc: 'AutoStop, idle cleanup, regressions' },
            { step: '3', label: 'You save money', desc: 'Every saving is logged & attributed' },
            { step: '4', label: 'We take 15%', desc: 'Only after ≥$500 in savings/month' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex items-start gap-3 min-w-[160px]">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">{label}</p>
                <p className="text-xs text-green-700 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Savings stats ── */}
      {!loadingData && summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Savings this month', value: fmt(summary.savings_this_month_usd), sub: summary.rollover_usd > 0 ? `+${fmt(summary.rollover_usd)} rolled over` : undefined, accent: 'green' },
            { label: 'Projected fee (15%)', value: fmt(summary.cloudlink_fee_this_month_usd), sub: summary.pending_billing ? 'Billing this month' : `$${Math.max(0, summary.billing_threshold_usd - summary.savings_this_month_usd).toFixed(0)} until billing` },
            { label: 'All-time savings', value: fmt(summary.savings_all_time_usd), sub: 'you keep 85%' },
            { label: 'All-time fees', value: fmt(summary.cloudlink_fee_all_time_usd), sub: 'total paid to Cloudlink' },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${accent === 'green' ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
              {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── Threshold progress ── */}
      {!loadingData && summary && summary.savings_this_month_usd < summary.billing_threshold_usd && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-amber-900">
              Billing threshold: {fmt(summary.savings_this_month_usd)} / {fmt(summary.billing_threshold_usd)} saved this month
            </span>
            <span className="text-amber-700 font-bold">
              {Math.round((summary.savings_this_month_usd / summary.billing_threshold_usd) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min((summary.savings_this_month_usd / summary.billing_threshold_usd) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-amber-700 mt-2">
            We don't charge until you've saved at least ${summary.billing_threshold_usd} in a month. Anything under that rolls to next month.
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* ── Payment method ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Payment method</div>

          {hasPaymentMethod ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-gray-800">Card on file</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                You'll be automatically charged at the end of each month when savings exceed $500.
                Stripe sends you an itemized invoice automatically.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="rounded-lg bg-white border border-gray-200 hover:border-green-300 px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition disabled:opacity-60"
                >
                  {portalLoading ? 'Opening…' : 'Manage payment method'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-gray-800">No card on file</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Add a payment method now so we can charge you automatically when you hit the $500 savings threshold.
                You won't be charged a cent before then.
              </p>
              <button
                onClick={openSetup}
                disabled={setupLoading}
                className="rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
              >
                {setupLoading ? 'Opening…' : 'Add payment method →'}
              </button>
            </div>
          )}
        </div>

        {/* ── Billing model FAQ ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">How billing works</div>
          <div className="space-y-3 text-sm">
            {[
              { q: 'What do you charge?', a: '15% of verified savings. No savings = no charge.' },
              { q: 'What counts as savings?', a: 'Cost reductions from AutoStopping, idle resource cleanup, regression prevention, and misconfiguration fixes.' },
              { q: 'When do you bill?', a: 'End of each month, only if savings ≥ $500. Below that rolls to next month.' },
              { q: 'Can I dispute a saving?', a: 'Yes. Flag any event and it\'s excluded from your invoice while we review it.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-medium text-gray-800">{q}</p>
                <p className="text-gray-500 text-xs mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Savings events with dispute button ── */}
      {events.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Verified savings events</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Flag any saving you believe is inaccurate — disputed events are excluded from your invoice.
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {events.map((ev) => {
              const isDisputed = ev.disputed || disputedEventIds.has(ev.id)
              return (
                <div key={ev.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                        {SAVING_TYPE_LABELS[ev.saving_type] || ev.saving_type}
                      </span>
                      {ev.billed && (
                        <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">billed</span>
                      )}
                      {isDisputed && (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">disputed</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{ev.description}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{ev.resource_id}</p>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">{fmt(ev.amount_saved_usd)}</p>
                    <p className="text-xs text-gray-400">{new Date(ev.timestamp).toLocaleDateString()}</p>
                    {!isDisputed && !ev.billed && (
                      <button
                        onClick={() => setDisputeEvent(ev)}
                        className="text-xs text-gray-400 hover:text-red-500 transition mt-0.5"
                      >
                        Dispute
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Open disputes ── */}
      {disputes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900 mb-3">Open disputes ({disputes.length})</h2>
          <div className="space-y-2">
            {disputes.map(d => (
              <div key={d.id} className="flex items-start justify-between text-xs bg-white rounded-lg border border-amber-100 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-700">Event #{d.saving_event_id.slice(-8)}</p>
                  <p className="text-gray-500 mt-0.5">{d.reason}</p>
                </div>
                <span className={`ml-3 px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${
                  d.status === 'open' ? 'bg-amber-100 text-amber-700' :
                  d.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
