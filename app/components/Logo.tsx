"use client";

/**
 * Cloudlink Global — brand logo components
 *
 * LogoMark   — icon only (gradient rounded-square + node-link symbol)
 * LogoWordmark — icon + "Cloudlink" text side by side
 */

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cloudlink logo mark"
    >
      <defs>
        <linearGradient
          id="cl-bg"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient
          id="cl-icon"
          x1="8"
          y1="14"
          x2="32"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#cl-bg)" />

      {/* Node-link mark: two nodes + connector + arc (cloud network) */}
      {/* Left node */}
      <circle cx="12" cy="21" r="3.5" fill="url(#cl-icon)" />
      {/* Right node */}
      <circle cx="28" cy="21" r="3.5" fill="url(#cl-icon)" />
      {/* Horizontal connector */}
      <line
        x1="15.5"
        y1="21"
        x2="24.5"
        y2="21"
        stroke="url(#cl-icon)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arc above (cloud silhouette suggestion) */}
      <path
        d="M10 21 C10 11, 30 11, 30 21"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoWordmark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span
        style={{
          fontSize: Math.round(size * 0.53),
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        Cloudlink
      </span>
    </div>
  );
}
