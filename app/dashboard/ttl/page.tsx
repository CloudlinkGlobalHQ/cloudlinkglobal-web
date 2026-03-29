"use client";

import { useState, useEffect } from "react";

interface TTLRule {
  id: string;
  environment_name: string;
  resource_id: string;
  resource_type: string;
  region: string;
  expires_at: string;
  remaining_seconds: number;
  status: "active" | "warning" | "expired";
  enabled: boolean;
  notes?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "https://cloudlink-agents-production.up.railway.app";

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "Expired";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const RESOURCE_TYPES = [
  { value: "ec2_stop", label: "EC2 — Stop instance" },
  { value: "ec2_terminate", label: "EC2 — Terminate instance" },
  { value: "rds_delete", label: "RDS — Delete instance" },
  { value: "ecs_scale_zero", label: "ECS — Scale to 0" },
];

export default function TTLPage() {
  const [rules, setRules] = useState<TTLRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    environment_name: "",
    resource_id: "",
    resource_type: "ec2_stop",
    region: "us-east-1",
    ttl_hours: "8",
    warning_minutes: "60",
    grace_minutes: "30",
    notes: "",
  });

   
  useEffect(() => {
    fetchRules();
    const iv = setInterval(fetchRules, 30000);
    return () => clearInterval(iv);
  }, []);

  async function fetchRules() {
    try {
      const r = await fetch(`${API}/ttl/rules`);
      if (r.ok) setRules(await r.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function createRule(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`${API}/ttl/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ttl_hours: parseFloat(form.ttl_hours),
        warning_minutes: parseInt(form.warning_minutes),
        grace_minutes: parseInt(form.grace_minutes),
      }),
    });
    setShowForm(false);
    setForm({ environment_name: "", resource_id: "", resource_type: "ec2_stop", region: "us-east-1", ttl_hours: "8", warning_minutes: "60", grace_minutes: "30", notes: "" });
    fetchRules();
  }

  async function snoozeRule(id: string) {
    await fetch(`${API}/ttl/rules/${id}/snooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours: 4 }),
    });
    fetchRules();
  }

  async function deleteRule(id: string) {
    await fetch(`${API}/ttl/rules/${id}`, { method: "DELETE" });
    fetchRules();
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
  };

  const active = rules.filter(r => r.status === "active").length;
  const warning = rules.filter(r => r.status === "warning").length;
  const expired = rules.filter(r => r.status === "expired").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TTL Auto-Destroy</h1>
          <p className="text-gray-500 text-sm mt-1">
            Set time-to-live on dev/staging environments. Cloudlink auto-terminates them when the timer expires.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New TTL Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active", value: active, color: "text-green-600" },
          { label: "Expiring Soon", value: warning, color: "text-yellow-600" },
          { label: "Expired", value: expired, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create TTL Rule</h2>
          <form onSubmit={createRule} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. staging-pr-142"
                value={form.environment_name}
                onChange={e => setForm(f => ({ ...f, environment_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. i-0abc123def456789"
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
                {RESOURCE_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TTL (hours)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.ttl_hours}
                onChange={e => setForm(f => ({ ...f, ttl_hours: e.target.value }))}
                min="0.5" step="0.5" required
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Warning Before (mins)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.warning_minutes}
                onChange={e => setForm(f => ({ ...f, warning_minutes: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="PR #142 staging environment"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Create Rule
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading TTL rules...</div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-gray-500">No TTL rules yet. Create one to auto-destroy environments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[rule.status]}`}>
                  {rule.status}
                </span>
                <div>
                  <div className="font-medium text-gray-900">{rule.environment_name}</div>
                  <div className="text-sm text-gray-500">{rule.resource_id} · {rule.resource_type} · {rule.region}</div>
                  {rule.notes && <div className="text-xs text-gray-400 mt-0.5">{rule.notes}</div>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-sm font-semibold ${rule.status === "expired" ? "text-red-600" : rule.status === "warning" ? "text-yellow-600" : "text-gray-700"}`}>
                    {formatDuration(rule.remaining_seconds)}
                  </div>
                  <div className="text-xs text-gray-400">remaining</div>
                </div>
                <div className="flex gap-2">
                  {rule.status !== "active" && (
                    <button
                      onClick={() => snoozeRule(rule.id)}
                      className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium"
                    >
                      +4h Snooze
                    </button>
                  )}
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
