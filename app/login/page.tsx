'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setKey, getStats } from '../lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [keyInput, setKeyInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    const k = keyInput.trim()
    if (!k) return
    setLoading(true)
    setError('')
    try {
      setKey(k)
      await getStats()
      router.push('/dashboard')
    } catch {
      setError('Invalid API key. Please check and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Cloudlink</span>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in to Cloudlink</h1>
          <p className="text-white/50 text-sm mb-8">Enter your API key to access your dashboard</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">API Key</label>
              <input
                type="password"
                placeholder="cl_••••••••••••••••••••••••"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={login}
              disabled={loading || !keyInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition shadow-lg shadow-indigo-600/30"
            >
              {loading ? 'Verifying…' : 'Continue →'}
            </button>
          </div>

          <p className="text-white/30 text-xs mt-6 text-center">
            Don&apos;t have an API key?{' '}
            <a href="/#waitlist" className="text-indigo-400 hover:text-indigo-300 underline">
              Join the waitlist
            </a>
          </p>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          © {new Date().getFullYear()} Cloudlink Global · All rights reserved
        </p>
      </div>
    </div>
  )
}
