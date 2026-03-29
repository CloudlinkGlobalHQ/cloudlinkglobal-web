'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBudgets, createBudget, deleteBudget, checkBudgets, getBudgetAlerts, getTrackedServices } from '../../lib/api'

interface Budget {
  budget_id: string
  name: string
  scope: string
  service: string | null
  monthly_limit_usd: number
  alert_thresholds: number[]
  action_on_breach: string
  enabled: number
  current_spend_usd?: number
  utilization_pct?: number
  created_at: string
}

interface BudgetAlert {
  alert_id: string
  budget_id: string
  threshold_pct: number
  current_spend_usd: number
  budget_limit_usd: number
  triggered_at: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [services, setServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [checking, setChecking] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkResult, setCheckResult] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [scope, setScope] = useState<'total' | 'service'>('total')
  const [service, setService] = useState('')
  const [limit, setLimit] = useState('')
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [b, a, s] = await Promise.all([getBudgets(), getBudgetAlerts(), getTrackedServices()])
      setBudgets(b)
      setAlerts(a)
      setServices(s.services || [])
    } catch {}
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh() }, [refresh])

  const handleCreate = async () => {
    if (!name || !limit) return
    setCreating(true)
    try {
      await createBudget({
        name,
        scope,
        service: scope === 'service' ? service : undefined,
        monthly_limit_usd: parseFloat(limit),
      })
      setShowCreate(false)
      setName('')
      setScope('total')
      setService('')
      setLimit('')
      refresh()
    } catch {}
    setCreating(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id)
      refresh()
    } catch {}
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      const result = await checkBudgets()
      setCheckResult(result)
      refresh()
    } catch {}
    setChecking(false)
    setTimeout(() => setCheckResult(null), 5000)
  }

  const utilizationColor = (pct: number) => {
    if (pct >= 100) return 'text-red-600 bg-red-50'
    if (pct >= 80) return 'text-amber-600 bg-amber-50'
    if (pct >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const barColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-amber-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) return <div className="text-center py-16 text-slate-400">Loading budgets…</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Guardrails</h1>
          <p className="text-sm text-slate-500 mt-1">Set spend limits, get alerts at thresholds, and prevent cost overruns.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCheck} disabled={checking}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-60">
            {checking ? 'Checking…' : 'Run budget check'}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-sm">
            + New budget
          </button>
        </div>
      </div>

      {checkResult && (
        <div className={`rounded-lg p-4 text-sm font-medium ${checkResult.alerts_fired > 0 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
          {checkResult.alerts_fired > 0
            ? `${checkResult.alerts_fired} budget alert(s) fired`
            : 'All budgets within limits'}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monthly AWS Budget"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Limit (USD)</label>
              <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="1000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Scope</label>
              <select value={scope} onChange={e => setScope(e.target.value as 'total' | 'service')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="total">Total spend (all services)</option>
                <option value="service">Specific service</option>
              </select>
            </div>
            {scope === 'service' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                <select value={service} onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select service…</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} disabled={creating || !name || !limit}
              className="text-sm font-medium px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60">
              {creating ? 'Creating…' : 'Create budget'}
            </button>
            <button onClick={() => setShowCreate(false)}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No budgets yet</h3>
          <p className="text-sm text-slate-500">Create your first budget to start monitoring cloud spend.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map(b => (
            <div key={b.budget_id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.scope === 'service' && b.service ? b.service : 'All services'} · Alerts at {b.alert_thresholds.join('%, ')}%
                  </p>
                </div>
                <button onClick={() => handleDelete(b.budget_id)}
                  className="text-xs text-slate-400 hover:text-red-500 transition">Delete</button>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">${(b.current_spend_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent</span>
                  <span className="text-slate-500">${b.monthly_limit_usd.toLocaleString()} limit</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor(b.utilization_pct || 0)}`}
                    style={{ width: `${Math.min(b.utilization_pct || 0, 100)}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${utilizationColor(b.utilization_pct || 0)}`}>
                  {(b.utilization_pct || 0).toFixed(1)}% used
                </span>
                <span className={`text-xs font-medium ${b.enabled ? 'text-green-600' : 'text-slate-400'}`}>
                  {b.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert history */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Alerts</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">Budget</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">Threshold</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">Spend</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">Limit</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">When</th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 20).map(a => {
                  const budget = budgets.find(b => b.budget_id === a.budget_id)
                  return (
                    <tr key={a.alert_id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2.5 text-gray-900">{budget?.name || a.budget_id.slice(0, 8)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.threshold_pct >= 100 ? 'bg-red-100 text-red-700' : a.threshold_pct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {a.threshold_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">${a.current_spend_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-slate-600">${a.budget_limit_usd.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(a.triggered_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
