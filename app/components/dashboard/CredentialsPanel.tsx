'use client'

import { useEffect, useState } from 'react'
import { getCredentials, addCredential, verifyCredential, deleteCredential, scanNow, getBase } from '../../lib/api'

const CLOUD_TABS = ['AWS', 'GCP', 'Azure']
const CLOUD_COLORS: Record<string, string> = {
  aws: 'bg-orange-50 text-orange-700 border-orange-200',
  gcp: 'bg-blue-50 text-blue-700 border-blue-200',
  azure: 'bg-cyan-50 text-cyan-700 border-cyan-200',
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
  const [gcpForm, setGcpForm]         = useState({ label: '', payload: '' })
  const [azureForm, setAzureForm]     = useState({ label: '', tenant_id_az: '', client_id: '', client_secret: '', subscription_id: '' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const load = async () => {
    setLoading(true)
    try { const d = await getCredentials(); setCreds(d.items || []) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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
        await addCredential({ cloud: 'gcp', label: gcpForm.label, credential_type: 'service_account_json', payload: gcpForm.payload })
        setGcpForm({ label: '', payload: '' })
      } else if (cloudTab === 'Azure') {
        await addCredential({ cloud: 'azure', label: azureForm.label, credential_type: 'client_secret', payload: `tenant_id=${azureForm.tenant_id_az}|client_id=${azureForm.client_id}|client_secret=${azureForm.client_secret}|subscription_id=${azureForm.subscription_id}` })
        setAzureForm({ label: '', tenant_id_az: '', client_id: '', client_secret: '', subscription_id: '' })
      }
      setShowForm(false); setMsg('Credential added.'); load()
    } catch (e: any) { setMsg(`Error: ${e.message}`) }
    setSaving(false)
  }

  const handleVerify = async (id: string) => {
    setBusy(b => ({ ...b, [id]: 'verify' }))
    try {
      const res = await verifyCredential(id)
      alert(`✅ Credential verified!\nAccount: ${res.identity?.account}\nARN: ${res.identity?.arn}`)
      load()
    } catch (e: any) { alert(`❌ Verification failed: ${e.message}`) }
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
    if (cloudTab === 'Azure') return !!(azureForm.tenant_id_az && azureForm.client_id && azureForm.client_secret && azureForm.subscription_id)
    return false
  }

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Credentials</h1>
          <p className="text-slate-500 text-sm mt-1">Cloud credentials used to scan and remediate infrastructure</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Add credential
        </button>
      </div>

      {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {CLOUD_TABS.map(t => (
              <button key={t} onClick={() => setCloudTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${cloudTab === t ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t}</button>
            ))}
          </div>

          {cloudTab === 'AWS' && (
            <>
              <h2 className="font-semibold text-slate-800 mb-4">Connect AWS Account</h2>
              <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
                {['IAM Role', 'Access Key'].map(t => (
                  <button key={t} onClick={() => setAwsAuthTab(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${awsAuthTab === t ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                ))}
              </div>

              {awsAuthTab === 'IAM Role' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={awsRoleForm.label} onChange={e => setAwsRoleForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Acme Production" className={inp} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Role ARN *</label><input value={awsRoleForm.role_arn} onChange={e => setAwsRoleForm(f => ({ ...f, role_arn: e.target.value }))} placeholder="arn:aws:iam::123456789012:role/CloudlinkRole" className={`${inp} font-mono`} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">External ID</label><input value={awsRoleForm.external_id} onChange={e => setAwsRoleForm(f => ({ ...f, external_id: e.target.value }))} placeholder="optional" className={inp} /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Regions</label><input value={awsRoleForm.regions} onChange={e => setAwsRoleForm(f => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></div>
                  <div className="md:col-span-2 bg-slate-50 rounded-lg p-4 text-xs text-slate-600">
                    <p className="font-medium text-slate-700 mb-2">Deploy the Cloudlink IAM Role via CloudFormation</p>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`${getBase()}/setup/cloudformation-template`} download="cloudlink-role.yaml" className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">↓ Download cloudlink-role.yaml</a>
                      <a href="https://console.aws.amazon.com/cloudformation/home#/stacks/create" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg transition">Open CloudFormation ↗</a>
                    </div>
                  </div>
                </div>
              )}

              {awsAuthTab === 'Access Key' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={awsKeyForm.label} onChange={e => setAwsKeyForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. My AWS Account" className={inp} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Access Key ID *</label><input value={awsKeyForm.access_key_id} onChange={e => setAwsKeyForm(f => ({ ...f, access_key_id: e.target.value }))} placeholder="AKIAIOSFODNN7EXAMPLE" className={`${inp} font-mono`} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Secret Access Key *</label><input value={awsKeyForm.secret_access_key} onChange={e => setAwsKeyForm(f => ({ ...f, secret_access_key: e.target.value }))} type="password" placeholder="••••••••••••••••••••••••••••••••••••••••" className={`${inp} font-mono`} /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">Regions</label><input value={awsKeyForm.regions} onChange={e => setAwsKeyForm(f => ({ ...f, regions: e.target.value }))} placeholder="us-east-1, us-west-2" className={inp} /></div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-xs text-amber-800">
                    <p className="font-medium mb-1">How to create AWS access keys</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>AWS Console → IAM → Users → Create user</li>
                      <li>Attach <code className="bg-amber-100 px-1 rounded">ReadOnlyAccess</code> + remediation policies</li>
                      <li>Security credentials → Create access key</li>
                      <li>Copy Access Key ID and Secret above</li>
                    </ol>
                  </div>
                </>
              )}
            </>
          )}

          {cloudTab === 'GCP' && (
            <>
              <h2 className="font-semibold text-slate-800 mb-4">Register GCP Service Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={gcpForm.label} onChange={e => setGcpForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. GCP Production" className={inp} /></div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Service Account JSON *</label>
                <textarea value={gcpForm.payload} onChange={e => setGcpForm(f => ({ ...f, payload: e.target.value }))} placeholder='{"type": "service_account", ...}' rows={6} className={`${inp} font-mono`} />
              </div>
            </>
          )}

          {cloudTab === 'Azure' && (
            <>
              <h2 className="font-semibold text-slate-800 mb-4">Register Azure Service Principal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Label</label><input value={azureForm.label} onChange={e => setAzureForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Azure Production" className={inp} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Tenant ID *</label><input value={azureForm.tenant_id_az} onChange={e => setAzureForm(f => ({ ...f, tenant_id_az: e.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inp} font-mono`} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Subscription ID *</label><input value={azureForm.subscription_id} onChange={e => setAzureForm(f => ({ ...f, subscription_id: e.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inp} font-mono`} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Client ID *</label><input value={azureForm.client_id} onChange={e => setAzureForm(f => ({ ...f, client_id: e.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inp} font-mono`} /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Client Secret *</label><input value={azureForm.client_secret} onChange={e => setAzureForm(f => ({ ...f, client_secret: e.target.value }))} type="password" placeholder="your-client-secret" className={inp} /></div>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={handleAdd} disabled={saving || !formValid()} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {saving ? 'Saving…' : 'Save credential'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : creds.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No credentials yet. Add one above to connect your cloud account.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Label','Cloud','Type','Added','Last Verified','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creds.map(c => (
                <tr key={c.credential_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{c.label || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs border px-2 py-0.5 rounded font-medium ${CLOUD_COLORS[c.cloud] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{c.cloud?.toUpperCase()}</span></td>
                  <td className="px-4 py-3"><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{c.credential_type}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.last_verified_at ? <span className="text-green-600">✓ {new Date(c.last_verified_at).toLocaleString()}</span> : <span className="text-yellow-600">Never verified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {(c.credential_type === 'iam_role' || c.credential_type === 'access_key') && (
                        <>
                          <button disabled={!!busy[c.credential_id]} onClick={() => handleVerify(c.credential_id)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg disabled:opacity-50 transition">{busy[c.credential_id] === 'verify' ? '…' : 'Verify'}</button>
                          <button disabled={!!busy[c.credential_id]} onClick={() => handleScan(c.credential_id)} className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-lg disabled:opacity-50 transition">{busy[c.credential_id] === 'scan' ? '⟳' : 'Scan'}</button>
                        </>
                      )}
                      <button disabled={!!busy[c.credential_id]} onClick={() => handleDelete(c.credential_id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg disabled:opacity-50 transition">Delete</button>
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
