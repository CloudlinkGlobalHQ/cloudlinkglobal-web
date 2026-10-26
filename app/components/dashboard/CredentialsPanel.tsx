'use client'

import { useState } from 'react'
import { getCredentials, addCredential, verifyCredential, deleteCredential, getBase, toApiError } from '../../lib/api'
import { describeError } from '../../lib/errors'
import { useApi } from '../../lib/useApi'
import { useScan } from '../../lib/scan'
import { EmptyState, ErrorState, LoadingState, PageHeader } from './states'

type Credential = {
  credential_id: string
  label?: string
  cloud?: string
  credential_type?: string
  created_at?: string
  last_verified_at?: string | null
}
type Notice = { tone: 'ok' | 'error'; text: string } | null

function errorText(e: unknown) {
  const d = describeError(toApiError(e))
  return d.hint ? `${d.title}. ${d.hint}` : `${d.title}. ${d.message}`
}

function Field({ id, label, children }: { id: string; label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  )
}

export default function CredentialsPanel() {
  const { data, error, loading, retry } = useApi(async () => {
    const d = await getCredentials()
    return (Array.isArray(d?.items) ? d.items : []) as Credential[]
  })
  const scan = useScan()
  const [busy, setBusy] = useState<Record<string, string | null>>({})
  const [showForm, setShowForm] = useState(false)
  const [authTab, setAuthTab] = useState<'IAM Role' | 'Access Key'>('IAM Role')
  const [roleForm, setRoleForm] = useState({ label: '', role_arn: '', external_id: '', regions: 'us-east-1' })
  const [keyForm, setKeyForm] = useState({ label: '', access_key_id: '', secret_access_key: '', regions: 'us-east-1' })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const regions = (s: string) => s.split(',').map((r) => r.trim()).filter(Boolean)

  const handleAdd = async () => {
    setSaving(true); setNotice(null)
    try {
      if (authTab === 'IAM Role') {
        await addCredential({ cloud: 'aws', label: roleForm.label, role_arn: roleForm.role_arn, external_id: roleForm.external_id || undefined, regions: regions(roleForm.regions) })
        setRoleForm({ label: '', role_arn: '', external_id: '', regions: 'us-east-1' })
      } else {
        await addCredential({ cloud: 'aws', label: keyForm.label, access_key_id: keyForm.access_key_id, secret_access_key: keyForm.secret_access_key, regions: regions(keyForm.regions) })
        setKeyForm({ label: '', access_key_id: '', secret_access_key: '', regions: 'us-east-1' })
      }
      setShowForm(false)
      setNotice({ tone: 'ok', text: 'AWS account connected. Run a scan to see your resources.' })
      retry()
    } catch (e) {
      setNotice({ tone: 'error', text: errorText(e) })
    }
    setSaving(false)
  }

  const handleVerify = async (id: string) => {
    setBusy((b) => ({ ...b, [id]: 'verify' })); setNotice(null)
    try {
      const res = await verifyCredential(id)
      const identity = res?.identity || {}
      setNotice({ tone: 'ok', text: `Role verified${identity.account ? ` for AWS account ${identity.account}` : ''}.` })
      retry()
    } catch (e) {
      setNotice({ tone: 'error', text: `Verification failed. ${errorText(e)}` })
    }
    setBusy((b) => ({ ...b, [id]: null }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Disconnect this AWS account from Cloudlink?')) return
    setBusy((b) => ({ ...b, [id]: 'delete' })); setNotice(null)
    try {
      await deleteCredential(id)
      setNotice({ tone: 'ok', text: 'Account disconnected.' })
      retry()
    } catch (e) {
      setNotice({ tone: 'error', text: errorText(e) })
    }
    setBusy((b) => ({ ...b, [id]: null }))
  }

  const formValid = authTab === 'IAM Role' ? !!roleForm.role_arn : !!(keyForm.access_key_id && keyForm.secret_access_key)
  const inp = 'dashboard-field w-full rounded-lg px-3 py-2 text-sm'
  const creds = data || []

  const header = (
    <PageHeader
      title="Credentials"
      subtitle="The read-only AWS role Cloudlink uses to scan your account"
      actions={<button type="button" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm} className="dashboard-primary-button px-4 py-2 text-sm">+ Connect AWS account</button>}
    />
  )

  return (
    <div>
      {header}

      {notice && (
        <p role={notice.tone === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-lg border px-4 py-3 text-sm ${notice.tone === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-[#10B981]/30 bg-[#10B981]/10 text-[#A7F3D0]'}`}>
          {notice.text}
        </p>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-[#1E2D4F] bg-[#0F1629] p-6">
          <h2 className="mb-1 font-semibold text-slate-100">Connect an AWS account</h2>
          <p className="mb-4 text-xs text-slate-400">
            Cloudlink assumes a read-only IAM role with Describe, Get and List permissions. It never changes anything, and you can delete the role at any time.
          </p>

          {authTab === 'IAM Role' ? (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field id="role-label" label="Label"><input id="role-label" value={roleForm.label} onChange={(e) => setRoleForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Production" className={inp} /></Field>
              <Field id="role-arn" label="Role ARN *"><input id="role-arn" value={roleForm.role_arn} onChange={(e) => setRoleForm((f) => ({ ...f, role_arn: e.target.value }))} placeholder="arn:aws:iam::123456789012:role/CloudlinkRole" className={`${inp} font-mono`} /></Field>
              <Field id="role-external-id" label={<>External ID <span className="font-normal text-slate-500">(optional)</span></>}><input id="role-external-id" value={roleForm.external_id} onChange={(e) => setRoleForm((f) => ({ ...f, external_id: e.target.value }))} className={inp} /></Field>
              <Field id="role-regions" label="Regions"><input id="role-regions" value={roleForm.regions} onChange={(e) => setRoleForm((f) => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></Field>
              <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 p-4 text-xs text-[#94A3B8] md:col-span-2">
                <p className="mb-2 font-medium text-[#F1F5F9]">Step 1 — Create the role in your AWS account</p>
                <p className="mb-3 text-[#94A3B8]">Download the CloudFormation template and deploy it in the AWS console. It creates a read-only role that Cloudlink can assume. It takes about a minute.</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`${getBase()}/setup/cloudformation-template`} download="cloudlink-role.yaml" className="inline-flex items-center gap-1 rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#059669]">↓ Download cloudlink-role.yaml</a>
                  <a href="https://console.aws.amazon.com/cloudformation/home#/stacks/create" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#1E2D4F] px-3 py-1.5 text-xs font-medium text-[#94A3B8] transition hover:bg-[#141C33]">Open CloudFormation console ↗</a>
                </div>
                <p className="mt-3">Step 2 — Copy <code className="rounded bg-[#141C33] px-1 font-mono text-[#10B981]">RoleArn</code> from the stack’s Outputs tab and paste it above.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <p className="mb-1 font-semibold">Not recommended</p>
                <p>Access keys are long-lived. If they leak, they keep working until you delete them. A read-only IAM role is safer.</p>
                <button type="button" onClick={() => setAuthTab('IAM Role')} className="mt-2 underline hover:text-red-200">Use an IAM role instead</button>
              </div>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field id="key-label" label="Label"><input id="key-label" value={keyForm.label} onChange={(e) => setKeyForm((f) => ({ ...f, label: e.target.value }))} className={inp} /></Field>
                <Field id="key-id" label="Access key ID *"><input id="key-id" value={keyForm.access_key_id} onChange={(e) => setKeyForm((f) => ({ ...f, access_key_id: e.target.value }))} autoComplete="off" className={`${inp} font-mono`} /></Field>
                <Field id="key-secret" label="Secret access key *"><input id="key-secret" value={keyForm.secret_access_key} onChange={(e) => setKeyForm((f) => ({ ...f, secret_access_key: e.target.value }))} type="password" autoComplete="off" className={`${inp} font-mono`} /></Field>
                <Field id="key-regions" label="Regions"><input id="key-regions" value={keyForm.regions} onChange={(e) => setKeyForm((f) => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></Field>
              </div>
            </>
          )}

          {authTab === 'IAM Role' && (
            <p className="mt-1 text-xs text-slate-500">
              Can’t use CloudFormation?{' '}
              <button type="button" onClick={() => setAuthTab('Access Key')} className="underline hover:text-slate-300">Use an access key instead</button> (not recommended)
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleAdd} disabled={saving || !formValid} className="dashboard-primary-button px-4 py-2 text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="dashboard-secondary-button px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <LoadingState label="Loading credentials…" />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={retry} />
      ) : creds.length === 0 ? (
        <EmptyState
          title="No AWS account connected"
          body="Connect a read-only IAM role to start scanning."
          action={showForm ? undefined : { label: 'Connect AWS account', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1E2D4F] bg-[#0F1629]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-[#1E2D4F] bg-[#141C33]">
              <tr>{['Label', 'Type', 'Added', 'Last verified', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4F]">
              {creds.map((c) => (
                <tr key={c.credential_id} className="hover:bg-[#141C33]">
                  <td className="px-4 py-3 font-medium text-slate-200">{c.label || '—'}</td>
                  <td className="px-4 py-3"><span className="rounded bg-[#10B981]/15 px-2 py-0.5 text-xs font-medium text-[#10B981]">{c.credential_type === 'access_key' ? 'Access key' : 'IAM role'}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.last_verified_at ? <span className="text-[#6EE7B7]">{new Date(c.last_verified_at).toLocaleString()}</span> : <span className="text-yellow-400">Never</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" disabled={!!busy[c.credential_id]} onClick={() => handleVerify(c.credential_id)} className="rounded-lg bg-[#1A2340] px-2 py-1 text-xs text-slate-300 transition hover:bg-[#1E2D4F] disabled:opacity-50">{busy[c.credential_id] === 'verify' ? 'Verifying…' : 'Verify'}</button>
                      <button type="button" disabled={scan.status === 'running'} onClick={() => { void scan.start() }} className="rounded-lg bg-[#10B981]/15 px-2 py-1 text-xs text-[#10B981] transition hover:bg-[#10B981]/25 disabled:opacity-50">{scan.status === 'running' ? 'Scanning…' : 'Scan'}</button>
                      <button type="button" disabled={!!busy[c.credential_id]} onClick={() => handleDelete(c.credential_id)} className="rounded-lg bg-red-500/15 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/25 disabled:opacity-50">{busy[c.credential_id] === 'delete' ? 'Removing…' : 'Disconnect'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
