"use client";

import Link from 'next/link'

// ─── Design tokens ───────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0E1A',
  sidebar: '#0F1629',
  card: '#141C33',
  border: '#1E2D4F',
  blue: '#4F6EF7',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  green: '#10B981',
}

// ─── Shared component styles ─────────────────────────────────────────────────

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  color: colors.textPrimary,
  marginBottom: '12px',
  marginTop: '0',
  letterSpacing: '-0.02em',
}

const bodyTextStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '15px',
  lineHeight: '1.7',
  color: colors.textSecondary,
  margin: '0 0 16px',
}

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '16px',
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: '13px',
  lineHeight: '1.65',
  color: colors.textSecondary,
  overflowX: 'auto',
  margin: '0 0 20px',
  whiteSpace: 'pre' as const,
}

const stepBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: colors.blue,
  color: '#fff',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 700,
  fontSize: '13px',
  flexShrink: 0,
}

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${colors.border}`,
  margin: '40px 0',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: `${colors.blue}18`,
        border: `1px solid ${colors.blue}40`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: colors.blue,
        textTransform: 'uppercase' as const,
        marginBottom: '14px',
      }}
    >
      {children}
    </div>
  )
}

function QuickStartCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        textDecoration: 'none',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = colors.blue
        el.style.backgroundColor = '#1A2440'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = colors.border
        el.style.backgroundColor = colors.card
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: `${colors.blue}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: colors.blue,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 6px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: colors.textSecondary,
          margin: 0,
          lineHeight: '1.5',
        }}
      >
        {description}
      </p>
    </Link>
  )
}

function StepRow({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        <div style={stepBadgeStyle}>{number}</div>
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '4px 0 0',
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ paddingLeft: '42px' }}>{children}</div>
    </div>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        padding: '1px 6px',
        color: colors.green,
      }}
    >
      {children}
    </code>
  )
}

function EndpointRow({
  method,
  path,
  description,
}: {
  method: string
  path: string
  description: string
}) {
  const methodColors: Record<string, string> = {
    GET: '#10B981',
    POST: colors.blue,
    PUT: '#F59E0B',
    DELETE: '#EF4444',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          fontWeight: 700,
          color: methodColors[method] ?? colors.textSecondary,
          minWidth: '40px',
          paddingTop: '1px',
        }}
      >
        {method}
      </span>
      <div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: colors.textPrimary,
            marginBottom: '2px',
          }}
        >
          {path}
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: colors.textMuted,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCloud() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div style={{ color: colors.textPrimary, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <SectionLabel>Documentation</SectionLabel>
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '36px',
            fontWeight: 800,
            color: colors.textPrimary,
            margin: '0 0 12px',
            letterSpacing: '-0.03em',
            lineHeight: '1.15',
          }}
        >
          Documentation
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '17px',
            color: colors.textSecondary,
            margin: 0,
            lineHeight: '1.6',
          }}
        >
          Everything you need to connect, monitor, and save.
        </p>
      </div>

      {/* ── Quick start cards ─────────────────────────────────────────────────── */}
      <section id="quick-start" style={{ marginBottom: '48px' }}>
        <h2 style={{ ...sectionHeadingStyle, fontSize: '18px', marginBottom: '16px' }}>
          Quick Start
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <QuickStartCard
            title="Connect AWS in 5 minutes"
            description="Run your first cost scan with a read-only IAM role."
            href="/docs/setup"
            icon={<IconCloud />}
          />
          <QuickStartCard
            title="Understand your dashboard"
            description="Explore savings, regressions, and AI recommendations."
            href="/docs"
            icon={<IconGrid />}
          />
          <QuickStartCard
            title="API Reference"
            description="Programmatic access to savings, disputes, and more."
            href="/docs/api-reference"
            icon={<IconCode />}
          />
        </div>
      </section>

      <hr style={dividerStyle} />

      {/* ── Getting Started guide ─────────────────────────────────────────────── */}
      <section id="introduction" style={{ marginBottom: '48px' }}>
        <SectionLabel>Getting Started</SectionLabel>
        <h2 style={sectionHeadingStyle}>Getting Started</h2>
        <p style={bodyTextStyle}>
          Cloudlink connects to your cloud provider with read-only access, analyses your infrastructure
          for idle resources, cost regressions, and misconfigurations, then surfaces actionable
          savings directly in the dashboard and via the API.
        </p>

        {/* Step 1 */}
        <StepRow number={1} title="Install the CLI and connect your cloud">
          <p style={{ ...bodyTextStyle, marginBottom: '12px' }}>
            Install the <InlineCode>@cloudlink/cli</InlineCode> package globally, authenticate with
            your Cloudlink account, then run the connect command for your cloud provider.
          </p>
          <pre style={codeBlockStyle}>{`\
# Install Cloudlink CLI
npm install -g @cloudlink/cli

# Authenticate
cloudlink auth login

# Connect your AWS account
cloudlink connect aws --read-only`}</pre>
          <p style={bodyTextStyle}>
            The <InlineCode>--read-only</InlineCode> flag ensures Cloudlink only requests the minimum
            IAM permissions needed to analyse your account — it never modifies resources.
          </p>
        </StepRow>

        {/* Step 2 */}
        <StepRow number={2} title="Create the IAM role">
          <p style={{ ...bodyTextStyle, marginBottom: '12px' }}>
            Cloudlink requires a cross-account IAM role with the following policy. You can create it
            via the AWS Console, CloudFormation, or Terraform. The CLI will guide you through the
            process interactively.
          </p>
          <pre style={codeBlockStyle}>{`\
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ce:GetCostAndUsage",
      "cloudwatch:GetMetricData",
      "ec2:DescribeInstances",
      "rds:DescribeDBInstances"
    ],
    "Resource": "*"
  }]
}`}</pre>
          <p style={bodyTextStyle}>
            Once the role is created, paste the Role ARN into the CLI prompt or the dashboard
            onboarding wizard. Cloudlink will validate connectivity before saving.
          </p>
        </StepRow>

        {/* Step 3 */}
        <StepRow number={3} title="Run your first scan">
          <p style={bodyTextStyle}>
            After connecting, trigger an initial cost scan. Cloudlink will ingest your AWS Cost
            Explorer data for the last 90 days, identify idle EC2 and RDS instances, flag cost
            regressions against your deploy timeline, and populate your dashboard within a few
            minutes.
          </p>
          <pre style={codeBlockStyle}>{`\
# Trigger a manual scan
cloudlink scan --provider aws

# View savings summary
cloudlink savings summary`}</pre>
          <p style={bodyTextStyle}>
            Scans run automatically every 24 hours after the initial connection. You can also trigger
            them on-demand via the CLI, dashboard, or REST API.
          </p>
        </StepRow>
      </section>

      <hr style={dividerStyle} />

      {/* ── Savings calculation ───────────────────────────────────────────────── */}
      <section id="savings-calculation" style={{ marginBottom: '48px' }}>
        <SectionLabel>Savings & Billing</SectionLabel>
        <h2 style={sectionHeadingStyle}>How Savings Are Calculated</h2>
        <p style={bodyTextStyle}>
          Every dollar of savings logged by Cloudlink maps to one of four saving types. Each type has
          a deterministic formula so you can audit and reproduce any figure independently.
        </p>

        {/* AUTOSTOP */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                color: colors.green,
                backgroundColor: `${colors.green}15`,
                border: `1px solid ${colors.green}30`,
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              AUTOSTOP
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: colors.textSecondary }}>
              Stopped idle instances during off-hours
            </span>
          </div>
          <pre style={{ ...codeBlockStyle, marginBottom: '8px' }}>{`savings = hourly_rate × hours_stopped`}</pre>
          <p style={{ ...bodyTextStyle, fontSize: '13px', margin: 0 }}>
            Cloudlink tracks the hourly on-demand rate for each instance type and multiplies by the
            number of hours the instance was stopped by AutoStopping automation.
          </p>
        </div>

        {/* IDLE_RESOURCE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                color: '#F59E0B',
                backgroundColor: '#F59E0B15',
                border: '1px solid #F59E0B30',
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              IDLE_RESOURCE
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: colors.textSecondary }}>
              Resources with no meaningful utilisation
            </span>
          </div>
          <pre style={{ ...codeBlockStyle, marginBottom: '8px' }}>{`savings = monthly_resource_cost`}</pre>
          <p style={{ ...bodyTextStyle, fontSize: '13px', margin: 0 }}>
            When a resource (e.g. an unattached EBS volume or idle RDS instance) has zero or
            near-zero utilisation for 30+ days, its full monthly cost is logged as a saving
            opportunity.
          </p>
        </div>

        {/* REGRESSION_PREVENTION */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                color: colors.blue,
                backgroundColor: `${colors.blue}15`,
                border: `1px solid ${colors.blue}30`,
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              REGRESSION_PREVENTION
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: colors.textSecondary }}>
              Cost spikes correlated with deploys
            </span>
          </div>
          <pre style={{ ...codeBlockStyle, marginBottom: '8px' }}>{`savings = actual_spend - baseline_spend`}</pre>
          <p style={{ ...bodyTextStyle, fontSize: '13px', margin: 0 }}>
            Cloudlink establishes a rolling cost baseline before each deploy event. When a regression
            is detected and resolved, the delta between the anomalous spend and the baseline is
            credited as savings prevented.
          </p>
        </div>

        {/* MISCONFIGURATION_FIX */}
        <div style={{ marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                color: '#A78BFA',
                backgroundColor: '#A78BFA15',
                border: '1px solid #A78BFA30',
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              MISCONFIGURATION_FIX
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: colors.textSecondary }}>
              Infrastructure mis-configs corrected
            </span>
          </div>
          <pre style={{ ...codeBlockStyle, marginBottom: '8px' }}>{`savings = cost_before - cost_after`}</pre>
          <p style={{ ...bodyTextStyle, fontSize: '13px', margin: 0 }}>
            For recommended fixes that the team acts on (e.g. switching to reserved instances or
            right-sizing), Cloudlink compares the cost 30 days before and after the change.
          </p>
        </div>
      </section>

      <hr style={dividerStyle} />

      {/* ── API Reference preview ─────────────────────────────────────────────── */}
      <section id="api-reference" style={{ marginBottom: '48px' }}>
        <SectionLabel>SDK & API</SectionLabel>
        <h2 style={sectionHeadingStyle}>API Reference</h2>
        <p style={bodyTextStyle}>
          The Cloudlink REST API lets you log savings events, fetch summaries, and manage disputes
          programmatically. All endpoints require a Bearer token obtained from your dashboard API
          settings.
        </p>

        {/* Base URL */}
        <div style={{ marginBottom: '20px' }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: colors.textMuted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              margin: '0 0 6px',
            }}
          >
            Base URL
          </p>
          <pre style={{ ...codeBlockStyle, margin: 0 }}>{`https://api.cloudlink.global/v1`}</pre>
        </div>

        {/* Endpoint table */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#0F1629',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: colors.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                minWidth: '40px',
              }}
            >
              Method
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: colors.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
              }}
            >
              Endpoint
            </span>
          </div>
          <EndpointRow method="POST" path="/api/savings/log" description="Log a new savings event" />
          <EndpointRow method="GET" path="/api/savings/summary/{userId}" description="Fetch aggregated savings summary for a user" />
          <EndpointRow method="POST" path="/api/savings/disputes" description="Open a dispute on a logged savings event" />
          <EndpointRow
            method="GET"
            path="/api/savings/disputes/{userId}"
            description="List all disputes for a user"
          />
        </div>

        {/* Example request */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            margin: '0 0 6px',
          }}
        >
          Example: Log a savings event
        </p>
        <pre style={codeBlockStyle}>{`\
curl -X POST https://api.cloudlink.global/v1/api/savings/log \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "usr_123",
    "type": "AUTOSTOP",
    "amount": 142.50,
    "currency": "USD",
    "resourceId": "i-0abc123def456",
    "metadata": {
      "hourlyRate": 0.475,
      "hoursStopped": 300
    }
  }'`}</pre>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            backgroundColor: `${colors.blue}10`,
            border: `1px solid ${colors.blue}30`,
            borderRadius: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: colors.textSecondary,
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            Full API documentation with request/response schemas, authentication, and rate limits is
            available at{' '}
            <Link href="/docs/api-reference" style={{ color: colors.blue, textDecoration: 'none' }}>
              /docs/api-reference
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Footer nav ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: colors.textMuted }}>
          Cloudlink Docs
        </span>
        <Link
          href="/docs/setup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: colors.blue,
            textDecoration: 'none',
          }}
        >
          Setup Guide →
        </Link>
      </div>
    </div>
  )
}
