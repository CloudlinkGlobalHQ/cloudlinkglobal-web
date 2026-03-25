"use client";

import { useState, useEffect } from "react";

interface DriftBaseline {
  id: string;
  resource_id: string;
  resource_type: string;
  region: string;
  last_checked?: string;
  last_drifted?: string;
  drift_count: number;
  expected_state: string;
}

interface DriftEvent {
  id: string;
  resource_id: string;
  resource_type: string;
  field: string;
  expected_value: string;
  actual_value: string;
  severity: "low" | "medium" | "high" | "critical";
  acknowledged: boolean;
  detected_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function DriftPage() {
  const [baselines, setBaselines] = useState<DriftBaseline[]>([]);
  const [events, setEvents] = useState<DriftEvent[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    resource_id: "",
    resource_type: "ec2",
    region: "us-east-1",
    expected_state: '{"state": "running", "instance_type": "t3.micro"}',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [bRes, eRes] = await Promise.all([
        fetch(`${API}/drift/baselines`),
        fetch(`${API}/drift/events?limit=50`),
      ]);
      if (bRes.ok) setBaselines(await bRes.json());
      if (eRes.ok) setEvents(await eRes.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function runScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const r = await fetch(`${API}/drift/scan`, { method: "POST" });
      if (r.ok) {
        const data = await r.json();
        setScanResult(data);
        fetchAll();
      }
    } finally {
      setScanning(false);
    }
  }

  async function createBaseline(e: React.FormEvent) {
    e.preventDefault();
    let expectedState: any;
    try {
      expectedState = JSON.parse(form.expected_state);
    } catch {
      alert("Invalid JSON in expected state");
      return;
    }
    await fetch(`${API}/drift/baselines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, expected_state: expectedState }),
    });
    setShowForm(false);
    setForm({ resource_id: "", resource_type: "ec2", region: "us-east-1", expected_state: '{"state": "running", "instance_type": "t3.micro"}' });
    fetchAll();
  }

  async function acknowledgeEvent(id: string) {
    await fetch(`${API}/drift/events/${id}/acknowledge`, { method: "POST" });
    setEvents(ev => ev.map(e => e.id === id ? { ...e, acknowledged: true } : e));
  }

  async function deleteBaseline(id: string) {
    await fetch(`${API}/drift/baselines/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const unackEvents = events.filter(e => !e.acknowledged);
  const criticalCount = unackEvents.filter(e => e.severity === "critical").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drift Detection</h1>
          <p className="text-gray-500 text-sm mt-1">
            Alert when actual AWS infrastructure diverges from expected state.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Baseline
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {scanning ? "Scanning..." : "🔍 Scan Now"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Baselines Monitored", value: baselines.length, color: "text-gray-900" },
          { label: "Unacknowledged Drifts", value: unackEvents.length, color: unackEvents.length > 0 ? "text-orange-600" : "text-gray-900" },
          { label: "Critical Drifts", value: criticalCount, color: criticalCount > 0 ? "text-red-600" : "text-gray-900" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scan result */}
      {scanResult && (
        <div className={`rounded-xl border p-4 mb-6 ${scanResult.drifts_found > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
          <div className="font-medium text-gray-900">
            {scanResult.drifts_found > 0
              ? `⚠️ ${scanResult.drifts_found} drift(s) detected across ${scanResult.baselines_checked} baselines`
              : `✅ No drift detected across ${scanResult.baselines_checked} baselines`}
          </div>
          <div className="text-sm text-gray-500 mt-1">Scanned at {new Date(scanResult.scanned_at).toLocaleTimeString()}</div>
        </div>
      )}

      {/* Create baseline form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Drift Baseline</h2>
          <form onSubmit={createBaseline} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="i-0abc123, sg-0abc123, my-bucket"
                value={form.resource_id}
                onChange={e => setForm(f => ({ ...f, resource_id: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.resource_type}
                onChange={e => setForm(f => ({ ...f, resource_type: e.target.value }))}
              >
                <option value="ec2">EC2 Instance</option>
                <option value="security_group">Security Group</option>
                <option value="s3_bucket">S3 Bucket</option>
                <option value="rds">RDS Instance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected State (JSON)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                rows={3}
                value={form.expected_state}
                onChange={e => setForm(f => ({ ...f, expected_state: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Add Baseline
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drift Events */}
      {unackEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Drift Events</h2>
          <div className="space-y-2">
            {unackEvents.map(event => (
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
                  onClick={() => acknowledgeEvent(event.id)}
                  className="ml-4 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 shrink-0"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Baselines Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Monitored Baselines</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : baselines.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🔎</div>
            <p className="text-gray-500">No baselines yet. Add a baseline to start monitoring drift.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Resource", "Type", "Region", "Drift Count", "Last Checked", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {baselines.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.resource_id}</td>
                    <td className="px-4 py-3 text-gray-600">{b.resource_type}</td>
                    <td className="px-4 py-3 text-gray-600">{b.region}</td>
                    <td className="px-4 py-3">
                      {b.drift_count > 0 ? (
                        <span className="text-orange-600 font-semibold">{b.drift_count}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {b.last_checked ? new Date(b.last_checked).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteBaseline(b.id)}
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
  );
}
