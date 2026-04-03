/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getApiKeys, createApiKey } from '../../lib/api'

interface ApiKey {
  api_key: string; name: string; description?: string; expires_at?: string; created_at?: string
}

export default function ApiKeysPage() {
  const [keys, setKeys]     = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [expireDays, setExpireDays] = useState<number | ''>('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey]   = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setKeys(await getApiKeys().then((r: any) => (r.api_keys as ApiKey[]) || [])) } catch {}
    finally { setLoading(false) }
  }, [])

   
  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await createApiKey({ name, description: desc, expires_days: expireDays || null })
      setNewKey(res.api_key)
      setShowCreate(false); setName(''); setDesc(''); setExpireDays('')
      load()
    } catch {}
    finally { setCreating(false) }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">API Keys</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage programmatic access keys for the Cloudlink Public API v1</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="dashboard-primary-button px-4 py-2 text-sm shadow-sm">
          + Create Key
        </button>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="dashboard-surface-elevated p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[#6EE7B7] mb-1">API key created. Store it now.</p>
              <p className="text-sm text-[#94A3B8] mb-3">This key will not be shown again. Copy it and store it securely.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0A0E1A] border border-[#1E2D4F] rounded-lg px-3 py-2 text-sm font-mono text-slate-200 break-all">
                  {newKey}
                </code>
                <button onClick={() => copy(newKey)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition ${copied ? 'bg-[#10B981] text-white' : 'dashboard-secondary-button'}`}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <button onClick={() => setNewKey(null)} className="text-slate-400 hover:text-slate-200 text-sm font-medium shrink-0">Close</button>
          </div>
        </div>
      )}

      {/* Usage docs */}
      <div className="bg-slate-900 rounded-xl p-5 text-sm">
        <p className="text-slate-400 mb-3 font-medium">Example usage</p>
        <pre className="text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{`# Get cost summary
curl https://cloudlink-agents-production.up.railway.app/v1/costs \\
  -H "Authorization: Bearer YOUR_API_KEY"

# List regressions
curl https://cloudlink-agents-production.up.railway.app/v1/regressions?status=open \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Get anomalies
curl https://cloudlink-agents-production.up.railway.app/v1/anomalies \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
      </div>

      {/* Keys table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-10 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-[#1E2D4F] bg-[#141C33]" />
          <p className="font-semibold text-slate-100">No API keys yet</p>
          <p className="text-sm text-slate-500 mt-1">Create a key to start using the Cloudlink Public API v1</p>
        </div>
      ) : (
        <div className="bg-[#0F1629] rounded-2xl border border-[#1E2D4F] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#141C33] border-b border-[#1E2D4F]/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Key (masked)</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Expires</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {keys.map((k, i) => (
                <tr key={i} className="hover:bg-[#141C33] transition">
                  <td className="px-6 py-3 font-medium text-slate-200">{k.name}</td>
                  <td className="px-6 py-3 font-mono text-slate-600 text-xs">{k.api_key}</td>
                  <td className="px-6 py-3 text-slate-500">{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-3 text-slate-400">{k.created_at ? new Date(k.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1629] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D4F]/50">
              <h3 className="text-lg font-bold text-slate-100">Create API Key</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-200 text-sm font-medium">Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="dashboard-field w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. CI/CD Pipeline, Terraform Provider" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <input value={desc} onChange={e => setDesc(e.target.value)}
                  className="dashboard-field w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="What is this key used for?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry <span className="text-slate-400 font-normal">(optional)</span></label>
                <select value={expireDays} onChange={e => setExpireDays(e.target.value ? Number(e.target.value) : '')}
                  className="dashboard-field w-full rounded-lg px-3 py-2 text-sm">
                  <option value="">Never expires</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1E2D4F]/50">
              <button onClick={() => setShowCreate(false)} className="dashboard-secondary-button px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || creating}
                className="dashboard-primary-button px-5 py-2 text-sm disabled:opacity-50 shadow-sm">
                {creating ? 'Creating…' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
