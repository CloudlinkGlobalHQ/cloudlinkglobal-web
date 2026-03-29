/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember } from '../../lib/api'

interface Member {
  member_id: string
  email: string
  name: string | null
  role: 'admin' | 'developer' | 'viewer'
  status: 'active' | 'pending' | 'suspended'
  created_at: string
}

const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700',
  developer: 'bg-blue-100 text-blue-700',
  viewer: 'bg-[#1A2340] text-slate-600',
}

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-500',
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (m: Member) => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true); setError(null)
    try {
      const m = await inviteTeamMember({ email: email.trim(), name: name.trim() || undefined, role })
      onInvite(m)
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1629] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2D4F]/50">
          <h2 className="text-lg font-bold text-slate-100">Invite Team Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full border border-[#1E2D4F] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (optional)</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border border-[#1E2D4F] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as any)}
              className="w-full border border-[#1E2D4F] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="viewer">Viewer — read-only access</option>
              <option value="developer">Developer — can approve/reject actions</option>
              <option value="admin">Admin — full access including billing</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-[#1E2D4F] rounded-lg text-slate-600 hover:bg-[#141C33]">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 transition">
            {loading ? 'Sending invite…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await getTeamMembers()
      setMembers(res.items ?? [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

   
  useEffect(() => { load() }, [load])

  const handleRoleChange = async (memberId: string, role: string) => {
    setUpdating(memberId)
    try {
      const updated = await updateTeamMember(memberId, { role })
      setMembers(prev => prev.map(m => m.member_id === memberId ? updated : m))
    } catch (e: any) { alert(e.message) }
    finally { setUpdating(null) }
  }

  const handleRemove = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return
    setUpdating(memberId)
    try {
      await removeTeamMember(memberId)
      setMembers(prev => prev.filter(m => m.member_id !== memberId))
    } catch (e: any) { alert(e.message) }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">Invite teammates to view and manage cloud costs</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm">
          + Invite member
        </button>
      </div>

      {/* Role legend */}
      <div className="bg-[#141C33] border border-[#1E2D4F] rounded-xl p-4 flex gap-6 text-sm flex-wrap">
        {[
          { role: 'admin', desc: 'Full access including billing and credentials' },
          { role: 'developer', desc: 'Can approve/reject actions and view all data' },
          { role: 'viewer', desc: 'Read-only access to dashboards and reports' },
        ].map(({ role, desc }) => (
          <div key={role} className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[role as keyof typeof ROLE_STYLES]}`}>{role}</span>
            <span className="text-slate-500">{desc}</span>
          </div>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center h-40"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>}

      {!loading && members.length === 0 && (
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-12 text-center shadow-sm">
          <p className="text-3xl mb-3">👥</p>
          <p className="font-semibold text-slate-700">No team members yet</p>
          <p className="text-sm text-slate-500 mt-1">Invite your first teammate to collaborate on cloud cost management.</p>
          <button onClick={() => setShowInvite(true)}
            className="mt-4 px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
            Invite someone
          </button>
        </div>
      )}

      {members.length > 0 && (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-[#141C33]">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(m => (
                <tr key={m.member_id} className={`hover:bg-[#141C33] ${updating === m.member_id ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {(m.name || m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{m.name || m.email}</div>
                        {m.name && <div className="text-xs text-slate-400">{m.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={m.role}
                      onChange={e => handleRoleChange(m.member_id, e.target.value)}
                      disabled={updating === m.member_id}
                      className="text-xs border border-[#1E2D4F] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 bg-[#0F1629]"
                    >
                      <option value="admin">admin</option>
                      <option value="developer">developer</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleRemove(m.member_id, m.email)}
                      disabled={updating === m.member_id}
                      className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={m => setMembers(prev => [...prev, m])}
        />
      )}
    </div>
  )
}
