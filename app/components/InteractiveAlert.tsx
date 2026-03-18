"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PresetKey = "ecs" | "lambda" | "rds";
type Preset = { key: PresetKey; label: string; service: string; deploy: string; hourlyPct: number; monthlyImpact: number; confidence: "High" | "Medium" };

const presets: Preset[] = [
  { key: "ecs",    label: "ECS",    service: "ECS · api-service",       deploy: "api@1.14.2",         hourlyPct: 18, monthlyImpact: 4200, confidence: "High"   },
  { key: "lambda", label: "Lambda", service: "Lambda · ingest-worker",  deploy: "ingest@0.9.7",       hourlyPct: 27, monthlyImpact: 1900, confidence: "High"   },
  { key: "rds",    label: "RDS",    service: "RDS · postgres-primary",  deploy: "migrations@2.3.0",   hourlyPct: 11, monthlyImpact: 6800, confidence: "Medium" },
];

function SwapText({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={String(children)}
        initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
        transition={{ duration: 0.3 }}>
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export default function InteractiveAlert({ cardClass }: { cardClass: string }) {
  const [active, setActive] = useState<PresetKey>("ecs");
  const preset = useMemo(() => presets.find((p) => p.key === active)!, [active]);

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Deploy detected → Cost regression</div>
          <div className="mt-1 text-xs text-gray-500">Detected 2h after deploy · Confidence: <SwapText>{preset.confidence}</SwapText></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          ALERT
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.key} type="button" onClick={() => setActive(p.key)}
            className={["relative rounded-full px-3 py-1.5 text-xs font-semibold transition border",
              p.key === active ? "bg-green-600 border-green-600 text-white" : "border-gray-200 text-gray-600 hover:border-green-300",
            ].join(" ")}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        {[
          { label: "Service",            value: preset.service,                    cls: "text-gray-900 font-semibold" },
          { label: "Deploy",             value: preset.deploy,                     cls: "text-gray-900 font-semibold font-mono text-xs" },
          { label: "Hourly cost change", value: `+${preset.hourlyPct}%`,           cls: "text-red-600 font-bold" },
          { label: "Est. monthly impact",value: `+$${preset.monthlyImpact.toLocaleString()}`, cls: "text-gray-900 font-semibold" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm ${cls}`}><SwapText>{value}</SwapText></span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["Deploy-linked", "Service baseline", "Impact estimate"].map((t) => (
          <span key={t} className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700 font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}
