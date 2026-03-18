"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PresetKey = "ecs" | "lambda" | "rds";

type Preset = {
  key: PresetKey;
  label: string;
  service: string;
  deploy: string;
  hourlyPct: number; // 18 => +18%
  monthlyImpact: number; // 4200 => $4,200
  confidence: "High" | "Medium";
};

const presets: Preset[] = [
  {
    key: "ecs",
    label: "ECS",
    service: "ECS · api-service",
    deploy: "api@1.14.2",
    hourlyPct: 18,
    monthlyImpact: 4200,
    confidence: "High",
  },
  {
    key: "lambda",
    label: "Lambda",
    service: "Lambda · ingest-worker",
    deploy: "ingest@0.9.7",
    hourlyPct: 27,
    monthlyImpact: 1900,
    confidence: "High",
  },
  {
    key: "rds",
    label: "RDS",
    service: "RDS · postgres-primary",
    deploy: "migrations@2.3.0",
    hourlyPct: 11,
    monthlyImpact: 6800,
    confidence: "Medium",
  },
];

function money(n: number) {
  return n.toLocaleString();
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative rounded-full px-3 py-1.5 text-xs font-semibold transition",
        "border border-white/15 hover:border-white/30",
        active ? "text-white" : "text-white/70",
      ].join(" ")}
    >
      {active && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-full bg-white/10"
          transition={{ type: "spring", stiffness: 550, damping: 35 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function SwapText({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={String(children)}
        initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
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
          <div className="text-sm font-semibold">Deploy detected → Cost regression</div>
          <div className="mt-1 text-xs text-white/50">
            Detected 2h after deploy • Confidence: <SwapText>{preset.confidence}</SwapText>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
          ALERT
        </span>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((p) => (
          <TabButton key={p.key} active={p.key === active} onClick={() => setActive(p.key)}>
            {p.label}
          </TabButton>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <span className="text-sm text-white/70">Service</span>
          <span className="text-sm font-semibold">
            <SwapText>{preset.service}</SwapText>
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <span className="text-sm text-white/70">Deploy</span>
          <span className="text-sm font-semibold">
            <SwapText>{preset.deploy}</SwapText>
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <span className="text-sm text-white/70">Hourly cost change</span>
          <span className="text-sm font-semibold text-red-200">
            +<SwapText>{preset.hourlyPct}</SwapText>%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <span className="text-sm text-white/70">Est. monthly impact</span>
          <span className="text-sm font-semibold">
            +$<SwapText>{money(preset.monthlyImpact)}</SwapText>
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
        <span className="rounded-full border border-white/15 px-3 py-1">Deploy-linked</span>
        <span className="rounded-full border border-white/15 px-3 py-1">Service baseline</span>
        <span className="rounded-full border border-white/15 px-3 py-1">Impact estimate</span>
      </div>
    </div>
  );
}
