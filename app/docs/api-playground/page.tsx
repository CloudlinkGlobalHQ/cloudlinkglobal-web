'use client'

import { useState } from 'react'

const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

const EXAMPLES = [
  { label: 'Health', method: 'GET', path: '/health', body: '' },
  { label: 'Stats', method: 'GET', path: '/stats', body: '' },
  { label: 'Public costs', method: 'GET', path: '/v1/costs?days=30', body: '' },
  { label: 'Open regressions', method: 'GET', path: '/regressions?status=open', body: '' },
  { label: 'Trigger scan', method: 'POST', path: '/scan', body: '' },
  {
    label: 'Create deploy',
    method: 'POST',
    path: '/deploys',
    body: JSON.stringify(
      {
        service: 'Amazon EC2',
        version: 'sha-demo-123',
        environment: 'production',
        source: 'docs-playground',
      },
      null,
      2,
    ),
  },
]

export default function APIPlaygroundPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE)
  const [apiKey, setApiKey] = useState('')
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/health')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')

  async function sendRequest() {
    setLoading(true)
    setResponse('')
    try {
      const headers: Record<string, string> = {}
      if (apiKey.trim()) headers.Authorization = `Bearer ${apiKey.trim()}`
      if (method !== 'GET' && body.trim()) headers['Content-Type'] = 'application/json'

      const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers,
        body: method === 'GET' ? undefined : (body.trim() || undefined),
      })

      const text = await res.text()
      try {
        const parsed = JSON.parse(text)
        setResponse(JSON.stringify({ status: res.status, ok: res.ok, data: parsed }, null, 2))
      } catch {
        setResponse(JSON.stringify({ status: res.status, ok: res.ok, data: text }, null, 2))
      }
    } catch (err) {
      setResponse(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  function loadExample(label: string) {
    const example = EXAMPLES.find((item) => item.label === label)
    if (!example) return
    setMethod(example.method)
    setPath(example.path)
    setBody(example.body)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Playground</h1>
        <p className="text-gray-500">
          Send live requests to your Cloudlink API without leaving the browser.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Base URL</span>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              placeholder="https://your-cloudlink-api"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">API key</span>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              placeholder="cl_live_..."
              type="password"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              onClick={() => loadExample(example.label)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
            >
              {example.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[120px_1fr]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Path</span>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm"
              placeholder="/v1/costs?days=30"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">JSON body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm"
            placeholder='{"service":"Amazon EC2","version":"sha-demo-123"}'
          />
        </label>

        <button
          onClick={sendRequest}
          disabled={loading}
          className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send request'}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-slate-950 p-6 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Response</p>
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-green-400">
          {response || 'No response yet.'}
        </pre>
      </div>
    </div>
  )
}
