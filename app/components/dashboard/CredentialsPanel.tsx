/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { getCredentials, addCredential, verifyCredential, deleteCredential, scanNow, getBase } from '../../lib/api'

const CLOUD_TABS = ['AWS', 'GCP', 'Azure']
const CLOUD_COLORS: Record<string, string> = {
  aws: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  gcp: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  azure: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
}

export default function CredentialsPanel({ onScanComplete }: { onScanComplete?: () => void }) {
  const [creds, setCreds]     = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy]       = useState<Record<string, string | null>>({})
  const [showForm, setShowForm] = useState(false)
  const [cloudTab, setCloudTab] = useState('AWS')
  const [awsAuthTab, setAwsAuthTab] = useState('IAM Role')
  const [awsRoleForm, setAwsRoleForm] = useState({ label: '', role_arn: '', external_id: '', regions: 'us-east-1' })
  const [awsKeyForm, setAwsKeyForm]   = useState({ label: '', access_key_id: '', secret_access_key: '', regions: 'us-east-1' })
  const [gcpForm, setGcpForm]         = useState({ label: '', payload: '', project_ids: '' })
  const [azureForm, setAzureForm]     = useState({ label: '', tenant_id_az: '', client_id: '', client_secret: '', subscription_ids: '' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try { const d = await getCredentials(); setCreds(d.items || []) } catch (e: any) { setError((e as Error)?.message || 'Something went wrong') }
    setLoading(false)
  }

   
   
  useEffect(() => { load() }, [])

  const formatVerifySuccess = (res: Record<string, any>) => {
    const identity = res?.identity || {}
    if (identity.provider === 'gcp' || identity.project_id || identity.accessible_projects) {
      const projects = identity.accessible_projects?.join(', ') || identity.project_id || 'verified'
      return `GCP credential verified!\nProjects: ${projects}`
    }
    if (identity.provider === 'azure' || identity.subscription_id || identity.subscription_ids) {
      const subscriptions = identity.subscription_ids?.join(', ') || identity.subscription_id || 'verified'
      return `Azure credential verified!\nSubscriptions: ${subscriptions}`
    }
    return `AWS credential verified!\nAccount: ${identity?.account || '—'}\nARN: ${identity?.arn || '—'}`
  }

  const handleAdd = async () => {
    setSaving(true); setMsg('')
    try {
      if (cloudTab === 'AWS') {
        if (awsAuthTab === 'IAM Role') {
          await addCredential({ cloud: 'aws', label: awsRoleForm.label, role_arn: awsRoleForm.role_arn, external_id: awsRoleForm.external_id || undefined, regions: awsRoleForm.regions.split(',').map(r => r.trim()).filter(Boolean) })
          setAwsRoleForm({ label: '', role_arn: '', external_id: '', regions: 'us-east-1' })
        } else {
          await addCredential({ cloud: 'aws', label: awsKeyForm.label, access_key_id: awsKeyForm.access_key_id, secret_access_key: awsKeyForm.secret_access_key, regions: awsKeyForm.regions.split(',').map(r => r.trim()).filter(Boolean) })
          setAwsKeyForm({ label: '', access_key_id: '', secret_access_key: '', regions: 'us-east-1' })
        }
      } else if (cloudTab === 'GCP') {
        let payload = gcpForm.payload
        const projectIds = gcpForm.project_ids.split(',').map(v => v.trim()).filter(Boolean)
        if (projectIds.length > 0) {
          try {
            const parsed = JSON.parse(gcpForm.payload || '{}')
            payload = JSON.stringify({ ...parsed, project_ids: projectIds })
          } catch {
            payload = gcpForm.payload
          }
        }
        await addCredential({ cloud: 'gcp', label: gcpForm.label, credential_type: 'service_account_json', payload })
        setGcpForm({ label: '', payload: '', project_ids: '' })
      } else if (cloudTab === 'Azure') {
        const subscriptionIds = azureForm.subscription_ids.split(',').map(v => v.trim()).filter(Boolean)
        await addCredential({
          cloud: 'azure',
          label: azureForm.label,
          credential_type: 'client_secret',
          payload: `tenant_id=${azureForm.tenant_id_az}|client_id=${azureForm.client_id}|client_secret=${azureForm.client_secret}|subscription_ids=${subscriptionIds.join(',')}`,
        })
        setAzureForm({ label: '', tenant_id_az: '', client_id: '', client_secret: '', subscription_ids: '' })
      }
      setShowForm(false); setMsg('Credential added.'); load()
     
    } catch (e: any) { setMsg(`Error: ${e.message}`) }
    setSaving(false)
  }

  const handleVerify = async (id: string) => {
    setBusy(b => ({ ...b, [id]: 'verify' }))
    try {
      const res = await verifyCredential(id)
      alert(formatVerifySuccess(res))
      load()
     
    } catch (e: any) { alert(`Verification failed: ${e.message}`) }
    setBusy(b => ({ ...b, [id]: null }))
  }

  const handleScan = async (id: string) => {
    setBusy(b => ({ ...b, [id]: 'scan' }))
    try {
      const res = await scanNow()
      setMsg(`Scan complete — ${res.total_events_found ?? 0} events found`)
      onScanComplete?.()
     
    } catch (e: any) { setMsg(`Scan error: ${e.message}`) }
    setBusy(b => ({ ...b, [id]: null }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this credential?')) return
    setBusy(b => ({ ...b, [id]: 'delete' }))
     
    try { await deleteCredential(id); load() } catch (e: any) { alert(e.message) }
    setBusy(b => ({ ...b, [id]: null }))
  }

  const formValid = () => {
    if (cloudTab === 'AWS') {
      if (awsAuthTab === 'IAM Role') return !!awsRoleForm.role_arn
      return !!(awsKeyForm.access_key_id && awsKeyForm.secret_access_key)
    }
    if (cloudTab === 'GCP') return !!gcpForm.payload
    if (cloudTab === 'Azure') return !!(azureForm.tenant_id_az && azureForm.client_id && azureForm.client_secret && azureForm.subscription_ids)
    return false
  }

  const inp = "dashboard-field w-full rounded-lg px-3 py-2 text-sm"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Credentials</h1>
          <p className="text-slate-500 text-sm mt-1">Cloud credentials used to scan and remediate infrastructure</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="dashboard-primary-button text-sm px-4 py-2">
          + Add credential
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
      {msg && <p className="text-sm text-[#6EE7B7] mb-4">{msg}</p>}

      {showForm && (
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-6 mb-6">
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {CLOUD_TABS.map(t => (
              <button key={t} onClick={() => setCloudTab(t)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${cloudTab === t ? 'dashboard-pill-active' : 'dashboard-pill hover:text-slate-200'}`}>{t}</button>
            ))}
          </div>

          {cloudTab === 'AWS' && (
            <>
              <h2 className="font-semibold text-slate-100 mb-1">Connect AWS Account</h2>
              <p className="text-xs text-slate-500 mb-4">
                Cloudlink uses a read-only IAM Role — no credentials are stored, and you can revoke access instantly.
              </p>

              {awsAuthTab === 'IAM Role' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={awsRoleForm.label} onChange={e => setAwsRoleForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Acme Production" className={inp} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Role ARN *</label><input value={awsRoleForm.role_arn} onChange={e => setAwsRoleForm(f => ({ ...f, role_arn: e.target.value }))} placeholder="arn:aws:iam::123456789012:role/CloudlinkRole" className={`${inp} font-mono`} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">External ID <span className="font-normal text-slate-400">(from your Cloudlink onboarding)</span></label><input value={awsRoleForm.external_id} onChange={e => setAwsRoleForm(f => ({ ...f, external_id: e.target.value }))} placeholder="optional" className={inp} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Regions</label><input value={awsRoleForm.regions} onChange={e => setAwsRoleForm(f => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></div>
                  <div className="md:col-span-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 text-xs text-[#94A3B8]">
                    <p className="font-medium text-[#F1F5F9] mb-2">Step 1 — Deploy the IAM Role into your AWS account</p>
                    <p className="text-[#64748B] mb-3">Download the CloudFormation template, then deploy it in your AWS Console. It creates a read-only role that Cloudlink can assume — nothing else. Takes about 60 seconds.</p>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`${getBase()}/setup/cloudformation-template`} download="cloudlink-role.yaml" className="inline-flex items-center gap-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">↓ Download cloudlink-role.yaml</a>
                      <a href="https://console.aws.amazon.com/cloudformation/home#/stacks/create" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 border border-[#1E2D4F] text-[#94A3B8] hover:bg-[#141C33] text-xs font-medium px-3 py-1.5 rounded-lg transition">Open CloudFormation Console ↗</a>
                    </div>
                    <p className="mt-3 text-[#64748B]">Step 2 — Copy the <code className="bg-[#141C33] px-1 rounded font-mono text-[#10B981]">RoleArn</code> from the CloudFormation Outputs tab and paste it above.</p>
                  </div>
                </div>
              )}

              {awsAuthTab === 'Access Key' && (
                <>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-xs text-red-400">
                    <p className="font-semibold mb-1">Warning: Not recommended for production</p>
                    <p>Access keys are long-lived credentials. If exposed, they grant permanent access to your AWS account. Use IAM Role assumption instead — it uses short-lived tokens and is the industry standard.</p>
                    <button onClick={() => setAwsAuthTab('IAM Role')} className="mt-2 underline text-red-400 hover:text-red-300">Switch to IAM Role (recommended)</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={awsKeyForm.label} onChange={e => setAwsKeyForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. My AWS Account" className={inp} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Access Key ID *</label><input value={awsKeyForm.access_key_id} onChange={e => setAwsKeyForm(f => ({ ...f, access_key_id: e.target.value }))} placeholder="AKIAIOSFODNN7EXAMPLE" className={`${inp} font-mono`} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Secret Access Key *</label><input value={awsKeyForm.secret_access_key} onChange={e => setAwsKeyForm(f => ({ ...f, secret_access_key: e.target.value }))} type="password" placeholder="••••••••••••••••••••••••••••••••••••••••" className={`${inp} font-mono`} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Regions</label><input value={awsKeyForm.regions} onChange={e => setAwsKeyForm(f => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></div>
                  </div>
                </>
              )}

              {awsAuthTab === 'IAM Role' && (
                <p className="text-xs text-slate-400 mt-1">
                  Not using CloudFormation?{' '}
                  <button onClick={() => setAwsAuthTab('Access Key')} className="underline hover:text-slate-600">
                    Use an access key instead
                  </button>
                  {' '}(not recommended)
                </p>
              )}
            </>
          )}

          {cloudTab === 'GCP' && (
            <>
              <h2 className="font-semibold text-slate-100 mb-4">Register GCP Service Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={gcpForm.label} onChange={e => setGcpForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. GCP Production" className={inp} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Project IDs</label><input value={gcpForm.project_ids} onChange={e => setGcpForm(f => ({ ...f, project_ids: e.target.value }))} placeholder="project-a, project-b" className={inp} /></div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Service Account JSON *</label>
                <textarea value={gcpForm.payload} onChange={e => setGcpForm(f => ({ ...f, payload: e.target.value }))} placeholder='{"type": "service_account", ...}' rows={6} className={`${inp} font-mono`} />
              </div>
            </>
          )}

          {cloudTab === 'Azure' && (
            <>
              <h2 className="font-semibold text-slate-100 mb-4">Register Azure Service Principal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={azureForm.label} onChange={e => setAzureForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Azure Production" className={inp} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Tenant ID *</label><input value={azureForm.tenant_id_az} onChange={e => setAzureForm(f => ({ ...f, tenant_id_az: e.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inp} font-mono`} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Subscription IDs *</label><input value={azureForm.subscription_ids} onChange={e => setAzureForm(f => ({ ...f, subscription_ids: e.target.value }))} placeholder="sub-a, sub-b" className={`${inp} font-mono`} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Client ID *</label><input value={azureForm.client_id} onChange={e => setAzureForm(f => ({ ...f, client_id: e.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inp} font-mono`} /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Client Secret *</label><input value={azureForm.client_secret} onChange={e => setAzureForm(f => ({ ...f, client_secret: e.target.value }))} type="password" placeholder="your-client-secret" className={inp} /></div>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={handleAdd} disabled={saving || !formValid()} className="dashboard-primary-button disabled:opacity-50 text-sm px-4 py-2">
              {saving ? 'Saving…' : 'Save credential'}
            </button>
            <button onClick={() => setShowForm(false)} className="dashboard-secondary-button text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : creds.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No credentials yet. Add one above to connect your cloud account.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#141C33] border-b border-[#1E2D4F]">
              <tr>{['Label','Cloud','Type','Added','Last Verified','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creds.map(c => (
                <tr key={c.credential_id} className="hover:bg-[#141C33]">
                  <td className="px-4 py-3 font-medium text-slate-700">{c.label || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs border px-2 py-0.5 rounded font-medium ${CLOUD_COLORS[c.cloud] || 'bg-[#141C33] text-slate-400 border-[#1E2D4F]'}`}>{c.cloud?.toUpperCase()}</span></td>
                  <td className="px-4 py-3"><span className="bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded text-xs font-medium">{c.credential_type}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.last_verified_at ? <span className="text-[#6EE7B7]">Verified {new Date(c.last_verified_at).toLocaleString()}</span> : <span className="text-yellow-500">Never verified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {(c.credential_type === 'iam_role' || c.credential_type === 'access_key' || c.credential_type === 'service_account_json' || c.credential_type === 'client_secret') && (
                        <>
                          <button disabled={!!busy[c.credential_id]} onClick={() => handleVerify(c.credential_id)} className="px-2 py-1 bg-[#1A2340] hover:bg-[#1E2D4F] text-slate-300 text-xs rounded-lg disabled:opacity-50 transition">{busy[c.credential_id] === 'verify' ? '…' : 'Verify'}</button>
                          <button disabled={!!busy[c.credential_id]} onClick={() => handleScan(c.credential_id)} className="px-2 py-1 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] text-xs rounded-lg disabled:opacity-50 transition">{busy[c.credential_id] === 'scan' ? '…' : 'Scan'}</button>
                        </>
                      )}
                      <button disabled={!!busy[c.credential_id]} onClick={() => handleDelete(c.credential_id)} className="px-2 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs rounded-lg disabled:opacity-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
