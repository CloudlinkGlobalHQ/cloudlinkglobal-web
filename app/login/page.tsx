'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setKey, getStats } from '../lib/api'

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cl-login-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#cl-login-bg)" />
      <circle cx="12" cy="21" r="3.5" fill="white" />
      <circle cx="28" cy="21" r="3.5" fill="white" />
      <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 21 C10 11, 30 11, 30 21" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Dot grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 mb-8 group w-fit">
          <Logo size={34} />
          <span className="text-gray-900 font-bold text-xl tracking-tight">Cloudlink</span>
        </a>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to Cloudlink</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your API key to access your dashboard</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">API Key</label>
              <input
                type="password"
                placeholder="cl_••••••••••••••••••••••••"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 font-mono"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={login}
              disabled={loading || !keyInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-sm"
            >
              {loading ? 'Verifying…' : 'Continue →'}
            </button>
          </div>

          <p className="text-gray-400 text-xs mt-6 text-center">
            Don&apos;t have an API key?{' '}
            <a href="/#waitlist" className="text-green-600 hover:underline">
              Join the waitlist
            </a>
          </p>
        </div>

        <p className="text-gray-400 text-xs text-center mt-6">
          © {new Date().getFullYear()} Cloudlink Global · All rights reserved
        </p>
      </div>
    </div>
  )
}
