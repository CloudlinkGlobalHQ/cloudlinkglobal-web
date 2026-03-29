'use client'

import { useState, useEffect, useCallback } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

interface NSCost {
  cluster: string; namespace: string
  cpu_cost_usd: number; mem_cost_usd: number; total_cost_usd: number
  pod_count: number
}
interface PodCost {
  pod: string; cluster: string; namespace: string
  cpu_cost_usd: number; mem_cost_usd: number; total_cost_usd: number
}
interface ClusterCost { cluster: string; total_cost_usd: number }
interface K8sSummary {
  total_cost_usd: number
  by_cluster: ClusterCost[]
  by_namespace: NSCost[]
  hourly_trend: { hour: string; cost_usd: number }[]
  hours_back: number
  record_count: number
}

function fmt(n: number) { return `$${n.toFixed(4)}` }
function fmtBig(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}k`
  return `$${n.toFixed(2)}`
}

export default function KubernetesPage() {
  const [summary, setSummary]     = useState<K8sSummary | null>(null)
  const [namespaces, setNamespaces] = useState<NSCost[]>([])
  const [pods, setPods]           = useState<PodCost[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [hoursBack, setHoursBack] = useState(168)
  const [activeTab, setActiveTab] = useState<'namespaces' | 'pods'>('namespaces')
  const [selectedCluster, setSelectedCluster] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const clusterQ = selectedCluster ? `&cluster=${encodeURIComponent(selectedCluster)}` : ''
      const [s, n, p] = await Promise.all([
        apiFetch(`/k8s/costs?hours_back=${hoursBack}${clusterQ}`),
        apiFetch(`/k8s/costs/namespaces?hours_back=${hoursBack}${clusterQ}`),
        apiFetch(`/k8s/costs/pods?hours_back=${hoursBack}${clusterQ}`),
      ])
      setSummary(s)
      setNamespaces(n.namespaces || [])
      setPods(p.pods || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [hoursBack, selectedCluster])

   
  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  )

  const hasData = summary && summary.record_count > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Kubernetes Cost Visibility</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cluster, namespace and pod-level cost allocation following the OpenCost spec
          </p>
        </div>
        <div className="flex items-center gap-3">
          {summary && summary.by_cluster.length > 1 && (
            <select value={selectedCluster} onChange={e => setSelectedCluster(e.target.value)}
              className="border border-[#1E2D4F] rounded-lg px-3 py-2 text-sm text-slate-700 bg-[#0F1629] focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">All clusters</option>
              {summary.by_cluster.map(c => (
                <option key={c.cluster} value={c.cluster}>{c.cluster}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1 bg-[#0F1629] border border-[#1E2D4F] rounded-lg p-1">
            {[24, 168, 720].map(h => (
              <button key={h} onClick={() => setHoursBack(h)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${hoursBack === h ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-[#1A2340]'}`}>
                {h === 24 ? '1d' : h === 168 ? '7d' : '30d'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
      )}

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cost', value: fmtBig(summary.total_cost_usd), sub: `${hoursBack}h period`, color: 'green' },
            { label: 'Clusters', value: String(summary.by_cluster.length), sub: 'tracked', color: 'blue' },
            { label: 'Namespaces', value: String(summary.by_namespace.length), sub: 'active', color: 'purple' },
            { label: 'Records', value: summary.record_count.toLocaleString(), sub: 'cost records', color: 'yellow' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={`bg-[#0F1629] rounded-xl border border-[#1E2D4F] border-l-4 border-l-${color}-500 shadow-sm p-5`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {!hasData ? (
        <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">☸️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Kubernetes Data Yet</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Ingest cost records from your Kubernetes clusters using OpenCost, Kubecost, or the Cloudlink K8s collector.
          </p>
          <div className="bg-[#141C33] border border-[#1E2D4F] rounded-xl p-4 text-left max-w-lg mx-auto">
            <p className="text-xs font-semibold text-slate-600 mb-2">Quick start — push cost records via API:</p>
            <pre className="text-xs text-slate-700 font-mono overflow-x-auto whitespace-pre-wrap">{`curl -X POST ${BASE}/k8s/ingest \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "records": [{
      "cluster": "prod-us-east",
      "namespace": "payments",
      "pod": "payments-api-7d9f",
      "cpu_cost_usd": 0.0012,
      "mem_cost_usd": 0.0003,
      "total_cost_usd": 0.0015
    }]
  }'`}</pre>
          </div>
        </div>
      ) : (
        <>
          {/* Cluster breakdown */}
          {summary && summary.by_cluster.length > 0 && (
            <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-200 mb-4">Cost by Cluster</h2>
              <div className="space-y-3">
                {summary.by_cluster.map(c => {
                  const pct = summary.total_cost_usd > 0 ? (c.total_cost_usd / summary.total_cost_usd) * 100 : 0
                  return (
                    <div key={c.cluster} className="flex items-center gap-4">
                      <div className="w-32 shrink-0">
                        <span className="text-sm font-medium text-slate-700 truncate block">{c.cluster}</span>
                      </div>
                      <div className="flex-1 bg-[#1A2340] rounded-full h-3 overflow-hidden">
                        <div className="h-3 bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-24 text-right shrink-0">
                        <span className="text-sm font-bold text-slate-100">{fmt(c.total_cost_usd)}</span>
                        <span className="text-xs text-slate-400 ml-1">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab: namespaces / pods */}
          <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] shadow-sm overflow-hidden">
            <div className="flex border-b border-[#1E2D4F]/50">
              {(['namespaces', 'pods'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-200'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'namespaces' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#141C33] border-b border-[#1E2D4F]/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Namespace</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cluster</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pods</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CPU Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mem Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {namespaces.map((ns, i) => (
                    <tr key={i} className="hover:bg-[#141C33] transition">
                      <td className="px-6 py-3 font-medium text-slate-200">
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono text-xs">{ns.namespace}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{ns.cluster}</td>
                      <td className="px-6 py-3 text-right text-slate-600">{ns.pod_count}</td>
                      <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt(ns.cpu_cost_usd)}</td>
                      <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt(ns.mem_cost_usd)}</td>
                      <td className="px-6 py-3 text-right font-bold text-slate-100 font-mono">{fmt(ns.total_cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'pods' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#141C33] border-b border-[#1E2D4F]/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pod</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Namespace</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CPU Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mem Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pods.map((pod, i) => (
                    <tr key={i} className="hover:bg-[#141C33] transition">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs bg-[#1A2340] text-slate-700 px-2 py-0.5 rounded">{pod.pod}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{pod.namespace}</td>
                      <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt(pod.cpu_cost_usd)}</td>
                      <td className="px-6 py-3 text-right text-slate-600 font-mono">{fmt(pod.mem_cost_usd)}</td>
                      <td className="px-6 py-3 text-right font-bold text-slate-100 font-mono">{fmt(pod.total_cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
