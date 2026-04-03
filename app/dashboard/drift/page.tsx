/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import {
  acknowledgeDriftEvent,
  createDriftBaseline,
  deleteDriftBaseline,
  getDriftBaselines,
  getDriftEvents,
  getDriftSummary,
  runDriftScan,
} from '../../lib/api'

interface DriftSummary {
  baseline_count?: number
  open_event_count?: number
  event_count?: number
  severity_counts?: Record<string, number>
}

interface ScanResult {
  drifts_found: number
  baselines_checked: number
  scanned_at: string
}

interface DriftBaseline {
  id: string
  resource_id: string
  resource_type: string
  region: string
  last_checked?: string
  last_drifted?: string
  drift_count: number
  expected_state: string
}

interface DriftEvent {
  id: string
  resource_id: string
  resource_type: string
  field: string
  expected_value: string
  actual_value: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  acknowledged: boolean
  detected_at: string
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function DriftPage() {
  const [baselines, setBaselines] = useState<DriftBaseline[]>([])
  const [events, setEvents] = useState<DriftEvent[]>([])
  const [summary, setSummary] = useState<DriftSummary | null>(null)
  const [scanning, setScanning] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [form, setForm] = useState({
    resource_id: '',
    resource_type: 'ec2_instance',
    region: 'us-east-1',
    expected_state: '{"state": "running", "instance_type": "t3.micro"}',
  })

  async function fetchAll() {
    setError('')
    try {
      const [baselineData, eventData, summaryData] = await Promise.all([
        getDriftBaselines() as Promise<DriftBaseline[]>,
        getDriftEvents({ limit: '50', ...(severityFilter !== 'all' ? { severity: severityFilter } : {}) }) as Promise<DriftEvent[]>,
        getDriftSummary() as Promise<DriftSummary>,
      ])
      setBaselines(Array.isArray(baselineData) ? baselineData : [])
      setEvents(Array.isArray(eventData) ? eventData : [])
      setSummary(summaryData)
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not load drift data')
    } finally {
      setLoading(false)
    }
  }

   
  useEffect(() => {
     
    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter])

  async function runScan() {
    setScanning(true)
    setScanResult(null)
    try {
      const data = await runDriftScan() as ScanResult
      setScanResult(data)
      await fetchAll()
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Drift scan failed')
    } finally {
      setScanning(false)
    }
  }

  async function submitBaseline(e: React.FormEvent) {
    e.preventDefault()
    let expectedState: unknown
    try {
      expectedState = JSON.parse(form.expected_state)
    } catch {
      alert('Invalid JSON in expected state')
      return
    }
    try {
      await createDriftBaseline({ ...form, expected_state: expectedState })
      setShowForm(false)
      setForm({
        resource_id: '',
        resource_type: 'ec2_instance',
        region: 'us-east-1',
        expected_state: '{"state": "running", "instance_type": "t3.micro"}',
      })
      await fetchAll()
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not create baseline')
    }
  }

  async function onAcknowledge(id: string) {
    try {
      await acknowledgeDriftEvent(id)
      setEvents((current) => current.map((event) => (event.id === id ? { ...event, acknowledged: true } : event)))
      await fetchAll()
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not acknowledge drift event')
    }
  }

  async function onDeleteBaseline(id: string) {
    try {
      await deleteDriftBaseline(id)
      await fetchAll()
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not delete baseline')
    }
  }

  const unackEvents = events.filter((event) => !event.acknowledged)
  const criticalCount = unackEvents.filter((event) => event.severity === 'critical').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Drift Detection</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor when live infrastructure drifts away from your expected state definitions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="dashboard-secondary-button px-4 py-2 text-sm"
          >
            + Add Baseline
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="dashboard-primary-button disabled:opacity-50 px-4 py-2 text-sm"
          >
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Baselines Monitored', value: summary?.baseline_count ?? baselines.length, color: 'text-slate-100' },
          { label: 'Open Drift Events', value: summary?.open_event_count ?? unackEvents.length, color: (summary?.open_event_count ?? unackEvents.length) > 0 ? 'text-orange-600' : 'text-slate-100' },
          { label: 'Critical Drifts', value: criticalCount, color: criticalCount > 0 ? 'text-red-600' : 'text-slate-100' },
          { label: 'Tracked Events', value: summary?.event_count ?? events.length, color: 'text-slate-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-4 text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {summary?.severity_counts && Object.keys(summary.severity_counts).length > 0 && (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Drift severity mix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Use this to prioritize investigation and approvals.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverityFilter(level)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    severityFilter === level ? 'dashboard-pill-active' : 'dashboard-pill hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(summary.severity_counts).map(([severity, count]) => (
              <span key={severity} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${SEVERITY_COLORS[severity] || 'bg-[#1A2340] text-slate-700 border-[#1E2D4F]'}`}>
                {severity}: {Number(count)}
              </span>
            ))}
          </div>
        </div>
      )}

      {scanResult && (
        <div className={`rounded-xl border p-4 mb-6 ${scanResult.drifts_found > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className="font-medium text-slate-100">
            {scanResult.drifts_found > 0
              ? `${scanResult.drifts_found} drift(s) detected across ${scanResult.baselines_checked} baselines`
              : `No drift detected across ${scanResult.baselines_checked} baselines`}
          </div>
          <div className="text-sm text-gray-500 mt-1">Scanned at {new Date(scanResult.scanned_at).toLocaleTimeString()}</div>
        </div>
      )}

      {showForm && (
        <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Add Drift Baseline</h2>
          <form onSubmit={submitBaseline} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="i-0abc123, sg-0abc123, my-bucket"
                value={form.resource_id}
                onChange={(e) => setForm((current) => ({ ...current, resource_id: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.resource_type}
                onChange={(e) => setForm((current) => ({ ...current, resource_type: e.target.value }))}
              >
                <option value="ec2_instance">EC2 Instance</option>
                <option value="security_group">Security Group</option>
                <option value="s3_bucket">S3 Bucket</option>
                <option value="rds_instance">RDS Instance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.region}
                onChange={(e) => setForm((current) => ({ ...current, region: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected State (JSON)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                rows={3}
                value={form.expected_state}
                onChange={(e) => setForm((current) => ({ ...current, expected_state: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Add Baseline
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-[#1A2340]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {unackEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Active Drift Events</h2>
          <div className="space-y-2">
            {unackEvents.map((event) => (
              <div key={event.id} className={`rounded-xl border p-4 flex items-center justify-between ${SEVERITY_COLORS[event.severity]}`}>
                <div>
                  <div className="font-medium">
                    <span className="uppercase text-xs mr-2">[{event.severity}]</span>
                    <code className="text-sm">{event.resource_id}</code> — {event.field} drifted
                  </div>
                  <div className="text-sm mt-1">
                    Expected: <code>{event.expected_value}</code> · Actual: <code>{event.actual_value}</code>
                  </div>
                  <div className="text-xs mt-1 opacity-70">{new Date(event.detected_at).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => onAcknowledge(event.id)}
                  className="ml-4 px-3 py-1.5 bg-[#0F1629] rounded-lg text-xs font-medium text-gray-700 hover:bg-[#141C33] border border-[#1E2D4F] shrink-0"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Monitored Baselines</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : baselines.length === 0 ? (
          <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] p-12 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-[#1E2D4F] bg-[#141C33]" />
            <p className="text-gray-500">No baselines yet. Add a baseline to start monitoring drift.</p>
          </div>
        ) : (
          <div className="bg-[#0F1629] rounded-xl border border-[#1E2D4F] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#141C33] border-b border-[#1E2D4F]">
                <tr>
                  {['Resource', 'Type', 'Region', 'Drift Count', 'Last Checked', ''].map((heading) => (
                    <th key={heading} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {baselines.map((baseline) => (
                  <tr key={baseline.id} className="hover:bg-[#141C33]">
                    <td className="px-4 py-3 font-mono text-xs">{baseline.resource_id}</td>
                    <td className="px-4 py-3 text-gray-600">{baseline.resource_type}</td>
                    <td className="px-4 py-3 text-gray-600">{baseline.region}</td>
                    <td className="px-4 py-3">
                      {baseline.drift_count > 0 ? (
                        <span className="text-orange-600 font-semibold">{baseline.drift_count}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {baseline.last_checked ? new Date(baseline.last_checked).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDeleteBaseline(baseline.id)}
                        className="text-gray-400 hover:text-red-500 text-xs"
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
      </div>
    </div>
  )
}
