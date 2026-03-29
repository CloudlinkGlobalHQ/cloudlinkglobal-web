/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTagCosts } from '../../lib/api'

interface TagBreakdown {
  tag_value: string
  resource_count: number
  total_mtd_usd: number
  pct_of_total: number
  resource_types: { type: string; count: number }[]
}
interface TagData {
  tag_key: string
  total_mtd_usd: number
  tagged_resource_pct: number
  breakdown: TagBreakdown[]
  common_tag_keys: string[]
}

const COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-yellow-500', 'bg-indigo-500',
]

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function TagCostsPage() {
  const [data, setData] = useState<TagData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tagKey, setTagKey] = useState('Environment')
  const [customKey, setCustomKey] = useState('')

  const load = useCallback(async (key: string) => {
    setLoading(true); setError(null)
    try { setData(await getTagCosts(key)) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

   
  useEffect(() => { load(tagKey) }, [tagKey, load])

  const handleCustomKey = () => {
    if (customKey.trim()) { setTagKey(customKey.trim()); setCustomKey('') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tag-Based Cost Allocation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Group resource costs by AWS tag to see which team/project/env is spending what</p>
        </div>
      </div>

      {/* Tag key selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Group by tag key:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(data?.common_tag_keys ?? ['Environment', 'Team', 'Project', 'Owner', 'CostCenter', 'Application']).map(k => (
            <button key={k} onClick={() => setTagKey(k)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                tagKey === k ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400'
              }`}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Custom tag key…"
            value={customKey}
            onChange={e => setCustomKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomKey()}
          />
          <button onClick={handleCustomKey}
            className="px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition border border-slate-200">
            Apply
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>}

      {data && !loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-l-4 border-l-green-500 border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total MTD Spend</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.total_mtd_usd)}</p>
            </div>
            <div className="bg-white rounded-xl border border-l-4 border-l-blue-500 border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Groups Found</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.breakdown.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">by <code className="bg-slate-100 px-1 rounded">{data.tag_key}</code> tag</p>
            </div>
            <div className={`bg-white rounded-xl border border-l-4 border-slate-200 p-5 shadow-sm ${data.tagged_resource_pct >= 80 ? 'border-l-green-500' : data.tagged_resource_pct >= 50 ? 'border-l-yellow-500' : 'border-l-red-400'}`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tag Coverage</p>
              <p className={`text-2xl font-bold mt-1 ${data.tagged_resource_pct >= 80 ? 'text-green-600' : data.tagged_resource_pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {data.tagged_resource_pct}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">resources tagged</p>
            </div>
          </div>

          {/* No data */}
          {data.breakdown.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-3xl mb-3">🏷️</p>
              <p className="font-semibold text-slate-700">No resources with <code className="bg-slate-100 px-1 rounded">{data.tag_key}</code> tag found</p>
              <p className="text-sm text-slate-500 mt-1">Make sure your AWS resources have this tag applied, then run a scan.</p>
            </div>
          )}

          {/* Breakdown */}
          {data.breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Cost by <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">{data.tag_key}</code> Tag</h2>
              </div>
              <div className="p-5 space-y-4">
                {data.breakdown.map((row, i) => (
                  <div key={row.tag_value}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{row.tag_value}</span>
                        <span className="text-xs text-slate-400">{row.resource_count} resource{row.resource_count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800 font-mono">{fmt(row.total_mtd_usd)}</span>
                        <span className="text-xs text-slate-400 ml-2">{row.pct_of_total}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                        style={{ width: `${row.pct_of_total}%` }}
                      />
                    </div>
                    {row.resource_types.length > 0 && (
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {row.resource_types.slice(0, 4).map(rt => (
                          <span key={rt.type} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {rt.type} ×{rt.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tagging advice */}
          {data.tagged_resource_pct < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Low tag coverage ({data.tagged_resource_pct}%)</h3>
              <p className="text-sm text-yellow-700">
                Only {data.tagged_resource_pct}% of resources have a <code className="bg-yellow-100 px-1 rounded">{data.tag_key}</code> tag.
                Without tagging, you can't accurately allocate costs by team or project.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Quick fix:</strong> Use AWS Tag Editor or enforce tags via AWS Organizations SCPs.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
