"use client";

import { useState } from 'react'
import Link from 'next/link'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0A0E1A',
  card: '#141C33',
  border: '#1E2D4F',
  green: '#10B981',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const h2: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 700,
  color: C.textPrimary, margin: '0 0 14px', letterSpacing: '-0.02em',
}
const h3: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600,
  color: C.textPrimary, margin: '24px 0 10px',
}
const body: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.75',
  color: C.textSecondary, margin: '0 0 14px',
}
const divider: React.CSSProperties = {
  border: 'none', borderTop: `1px solid ${C.border}`, margin: '56px 0',
}
const note: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '1.6',
  color: C.textSecondary, backgroundColor: `${C.green}10`,
  border: `1px solid ${C.green}30`, borderRadius: '8px',
  padding: '12px 16px', margin: '0 0 16px',
}
const warn: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '1.6',
  color: '#E2E8F0', backgroundColor: '#F59E0B10',
  border: '1px solid #F59E0B30', borderRadius: '8px',
  padding: '12px 16px', margin: '0 0 16px',
}
const listStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.75',
  color: C.textSecondary, paddingLeft: '20px', margin: '0 0 16px',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  const copyAnchor = () => {
    const url = `${window.location.origin}/docs#${id}`
    navigator.clipboard.writeText(url)
  }
  return (
    <h2 id={id} style={{ ...h2, display: 'flex', alignItems: 'center', gap: '8px', scrollMarginTop: '24px', cursor: 'default' }}>
      {children}
      <button
        onClick={copyAnchor}
        title="Copy link"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '0 4px', fontSize: '14px', opacity: 0.6 }}
        aria-label="Copy anchor link"
      >#</button>
    </h2>
  )
}

function SubAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} style={{ ...h3, scrollMarginTop: '24px' }}>{children}</h3>
  )
}

function CodeBlock({ children, language = '' }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative', margin: '0 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F1629', border: `1px solid ${C.border}`, borderBottom: 'none', borderRadius: '8px 8px 0 0', padding: '6px 14px' }}>
        {language && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.textMuted, fontWeight: 500 }}>{language}</span>}
        <button
          onClick={copy}
          style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${C.border}`, borderRadius: '4px', cursor: 'pointer', color: copied ? C.green : C.textMuted, fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '2px 8px', transition: 'color 0.15s' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '0 0 8px 8px', padding: '16px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: '1.65', color: '#A5D6A7', overflowX: 'auto', margin: 0, whiteSpace: 'pre' }}>
        {children}
      </pre>
    </div>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '4px', padding: '1px 6px', color: C.green }}>
      {children}
    </code>
  )
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, color, backgroundColor: `${color}15`, border: `1px solid ${color}30`, borderRadius: '4px', padding: '2px 8px' }}>
      {children}
    </span>
  )
}

function StepItem({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
      <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: C.textPrimary, marginBottom: '8px' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function EndpointRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const mc: Record<string, string> = { GET: '#10B981', POST: '#3B82F6', PUT: '#F59E0B', DELETE: '#EF4444' }
  return (
    <div style={{ display: 'flex', gap: '14px', padding: '11px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'flex-start' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, color: mc[method] ?? C.textSecondary, minWidth: '44px', paddingTop: '1px' }}>{method}</span>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: C.textPrimary, marginBottom: '2px' }}>{path}</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.textMuted }}>{desc}</div>
      </div>
    </div>
  )
}

function EndpointTable({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '8px 16px', backgroundColor: '#0F1629', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '14px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.06em', minWidth: '44px' }}>Method</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Endpoint</span>
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <article style={{ color: C.textPrimary, fontFamily: 'Inter, sans-serif' }}>

      {/* Page title */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: '6px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: C.green, textTransform: 'uppercase' as const, marginBottom: '14px' }}>
          Documentation
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '36px', fontWeight: 800, color: C.textPrimary, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: '1.15' }}>
          Cloudlink Documentation
        </h1>
        <p style={{ ...body, fontSize: '17px', margin: 0 }}>
          Everything you need to connect your cloud, understand your costs, and start saving.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          GETTING STARTED
      ═══════════════════════════════════════════════════════════════════════ */}

      <SectionAnchor id="what-is-cloudlink">What is Cloudlink?</SectionAnchor>
      <p style={body}>
        Cloudlink Global is a cloud cost intelligence platform that helps engineering teams find, understand, and fix cloud cost problems automatically. Unlike traditional cost tools that show you aggregated spend, Cloudlink links every cost change to the specific deploy, resource, or configuration that caused it.
      </p>
      <p style={body}>
        We connect to your cloud accounts read-only and continuously monitor for cost regressions, idle resources, and billing anomalies. When we find something, we alert your team via Slack or email with the exact cause, estimated monthly impact, and a recommended fix.
      </p>
      <p style={body}>
        Our business model is simple: we charge 15% of what we save you. If we save you nothing, you pay nothing.
      </p>

      <hr style={divider} />

      <SectionAnchor id="how-pricing-works">How the pricing works</SectionAnchor>
      <p style={body}>
        Cloudlink operates on a pure performance model. There are no subscriptions, no upfront fees, and no monthly minimums.
      </p>
      <p style={body}>Here is exactly how it works:</p>
      <ul style={listStyle}>
        <li>We connect to your cloud account and monitor continuously</li>
        <li>Every time we find and fix a cost problem, we log the saving</li>
        <li>At the end of each month, we calculate your total verified savings</li>
        <li>We invoice you for 15% of that total</li>
        <li>If your savings for the month are under $500, they roll over to the following month</li>
        <li>If we save you nothing, you owe us nothing</li>
      </ul>
      <p style={note}>
        <strong style={{ color: C.green }}>Example:</strong> If Cloudlink saves your team $20,000 in a month, your invoice is $3,000. You keep $17,000.
      </p>

      <hr style={divider} />

      <SectionAnchor id="quick-start">Quick start (5 minutes)</SectionAnchor>
      <StepItem n={1} title="Create your account">
        <p style={body}>Go to <Link href="/signup" style={{ color: C.green }}>cloudlinkglobal.com/signup</Link> and create a free account. No credit card required.</p>
      </StepItem>
      <StepItem n={2} title="Connect your first cloud account">
        <p style={body}>Navigate to <strong>Settings → Cloud Connections</strong>. Click <strong>Connect AWS Account</strong>. This opens a CloudFormation template in your AWS console. Deploy the stack — it creates a read-only IAM role that Cloudlink uses to scan your account. The entire process takes approximately 5 minutes.</p>
      </StepItem>
      <StepItem n={3} title="Wait for your baseline">
        <p style={body}>Cloudlink spends the first 24 hours building a cost baseline for each of your services. This baseline is used to detect regressions — spend that is higher than your normal pattern.</p>
      </StepItem>
      <StepItem n={4} title="Receive your first alerts">
        <p style={body}>Once your baseline is established, you will begin receiving alerts when cost anomalies are detected. Connect Slack in <strong>Settings → Notifications</strong> to receive real-time alerts in your engineering channels.</p>
      </StepItem>

      <hr style={divider} />

      <SectionAnchor id="system-requirements">System requirements</SectionAnchor>
      <p style={body}>Cloudlink is a hosted SaaS product — there is nothing to install or maintain. The only requirements are:</p>
      <ul style={listStyle}>
        <li>An AWS, GCP, or Azure account with permission to deploy IAM roles or service accounts</li>
        <li>Access to the relevant cloud console to deploy the Cloudlink read-only role</li>
        <li>A modern browser (Chrome, Firefox, Safari, Edge)</li>
      </ul>
      <p style={body}>For SDK usage, you will need Python 3.8+ or Node.js 16+.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONNECTING YOUR CLOUD
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="connecting-aws">Connecting AWS</SectionAnchor>
      <p style={body}><strong>Prerequisites:</strong> AWS account with permission to deploy CloudFormation stacks.</p>
      <StepItem n={1} title="Open the connection wizard">
        <p style={body}>Go to <strong>Settings → Cloud Connections</strong> and click <strong>Connect AWS Account</strong>.</p>
      </StepItem>
      <StepItem n={2} title="Deploy the CloudFormation stack">
        <p style={body}>You will be redirected to AWS CloudFormation with a pre-configured template. The template creates:</p>
        <ul style={listStyle}>
          <li>A read-only IAM role (<InlineCode>CloudlinkReadOnlyRole</InlineCode>)</li>
          <li>A trust policy allowing Cloudlink's account to assume the role</li>
          <li>An external ID for additional security</li>
        </ul>
        <p style={body}>Deploy the stack — this takes approximately 2 minutes.</p>
      </StepItem>
      <StepItem n={3} title="Copy the Role ARN">
        <p style={body}>Once the stack is deployed, copy the Role ARN from the CloudFormation <strong>Outputs</strong> tab and paste it into Cloudlink.</p>
      </StepItem>
      <StepItem n={4} title="Verify the connection">
        <p style={body}>Click <strong>Verify Connection</strong>. Cloudlink will assume the role and confirm read access before saving.</p>
      </StepItem>
      <p style={note}><strong style={{ color: C.green }}>Important:</strong> Cloudlink only ever has read access to your AWS account. We can never modify, create, or delete any resources without your explicit approval through the dashboard.</p>
      <h3 style={h3}>Services we access</h3>
      <ul style={listStyle}>
        <li>AWS Cost Explorer — cost and usage data</li>
        <li>CloudWatch — metrics and resource utilisation</li>
        <li>EC2 — instance inventory and state</li>
        <li>EBS — volume inventory and attachment status</li>
        <li>Lambda — function inventory and invocation metrics</li>
        <li>RDS — database instance inventory</li>
        <li>S3 — bucket inventory and public access settings</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="connecting-azure">Connecting Azure</SectionAnchor>
      <p style={body}>Azure connection uses an Azure Active Directory service principal with read-only permissions.</p>
      <StepItem n={1} title="Create a service principal">
        <CodeBlock language="bash">{`# Create the service principal and note the output
az ad sp create-for-rbac \\
  --name "CloudlinkReadOnly" \\
  --role "Reader" \\
  --scopes /subscriptions/<SUBSCRIPTION_ID>`}</CodeBlock>
      </StepItem>
      <StepItem n={2} title="Grant Cost Management Reader role">
        <CodeBlock language="bash">{`az role assignment create \\
  --assignee <SERVICE_PRINCIPAL_APP_ID> \\
  --role "Cost Management Reader" \\
  --scope /subscriptions/<SUBSCRIPTION_ID>`}</CodeBlock>
      </StepItem>
      <StepItem n={3} title="Enter credentials in Cloudlink">
        <p style={body}>Navigate to <strong>Settings → Cloud Connections → Connect Azure</strong> and enter your Tenant ID, Client ID, Client Secret, and Subscription ID.</p>
      </StepItem>

      <hr style={divider} />

      <SectionAnchor id="connecting-gcp">Connecting GCP</SectionAnchor>
      <p style={body}>GCP connection uses a service account with the Viewer and Billing Account Viewer roles.</p>
      <StepItem n={1} title="Create the service account">
        <CodeBlock language="bash">{`gcloud iam service-accounts create cloudlink-readonly \\
  --description="Cloudlink read-only access" \\
  --display-name="Cloudlink Read Only"`}</CodeBlock>
      </StepItem>
      <StepItem n={2} title="Assign roles">
        <CodeBlock language="bash">{`# Viewer role for resource inventory
gcloud projects add-iam-policy-binding <PROJECT_ID> \\
  --member="serviceAccount:cloudlink-readonly@<PROJECT_ID>.iam.gserviceaccount.com" \\
  --role="roles/viewer"

# Billing viewer for cost data
gcloud billing accounts add-iam-policy-binding <BILLING_ACCOUNT_ID> \\
  --member="serviceAccount:cloudlink-readonly@<PROJECT_ID>.iam.gserviceaccount.com" \\
  --role="roles/billing.viewer"`}</CodeBlock>
      </StepItem>
      <StepItem n={3} title="Download key and upload to Cloudlink">
        <CodeBlock language="bash">{`gcloud iam service-accounts keys create cloudlink-key.json \\
  --iam-account=cloudlink-readonly@<PROJECT_ID>.iam.gserviceaccount.com`}</CodeBlock>
        <p style={body}>Upload the <InlineCode>cloudlink-key.json</InlineCode> file in <strong>Settings → Cloud Connections → Connect GCP</strong>.</p>
      </StepItem>

      <hr style={divider} />

      <SectionAnchor id="managing-connections">Managing connections</SectionAnchor>
      <p style={body}>All connected cloud accounts are listed in <strong>Settings → Cloud Connections</strong>. From this page you can:</p>
      <ul style={listStyle}>
        <li>View connection status and last successful sync time</li>
        <li>Manually trigger a re-scan for any account</li>
        <li>Rotate credentials for any connection</li>
        <li>Remove a cloud account connection</li>
        <li>Connect additional accounts (multi-account support for AWS Organisations)</li>
      </ul>

      {/* ═══════════════════════════════════════════════════════════════════════
          DASHBOARD
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="dashboard-overview">Overview page</SectionAnchor>
      <p style={body}>The Overview page is the main landing page of your Cloudlink dashboard. It gives you an at-a-glance view of your cloud cost health across all connected accounts.</p>
      <p style={body}>The overview page shows:</p>
      <ul style={listStyle}>
        <li><strong>Total savings this month</strong> — verified savings generated by Cloudlink actions and detections</li>
        <li><strong>Active regressions</strong> — cost spikes that have been detected and are awaiting resolution</li>
        <li><strong>Idle resources</strong> — resources with zero or near-zero utilisation that are still incurring charges</li>
        <li><strong>Cost trend</strong> — your cloud spend over the last 30 days against your baseline</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="kpi-cards">Reading the KPI cards</SectionAnchor>
      <p style={body}>The KPI cards at the top of each dashboard page show high-level metrics. Each card includes:</p>
      <ul style={listStyle}>
        <li><strong>Current value</strong> — the current period (month-to-date or trailing 30 days depending on the page)</li>
        <li><strong>Delta indicator</strong> — the change versus the prior period, shown in green (improvement) or red (regression)</li>
        <li><strong>Sparkline</strong> — a mini chart showing the trend over the last 7 days</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="cost-chart">Cost over time chart</SectionAnchor>
      <p style={body}>The cost over time chart shows your total cloud spend as a daily time series. The chart includes:</p>
      <ul style={listStyle}>
        <li><strong>Actual spend line</strong> — your real daily cloud spend</li>
        <li><strong>Baseline band</strong> — the expected spend range based on your historical pattern</li>
        <li><strong>Regression markers</strong> — vertical lines marking when a cost regression was detected</li>
        <li><strong>Deploy markers</strong> — optional markers when a deployment was recorded via the webhook</li>
      </ul>
      <p style={body}>You can filter the chart by service, region, or resource type using the controls above the chart.</p>

      <hr style={divider} />

      <SectionAnchor id="savings-breakdown">Savings breakdown</SectionAnchor>
      <p style={body}>The Savings page breaks down your verified savings by category:</p>
      <ul style={listStyle}>
        <li><strong>AutoStop savings</strong> — from automatically stopping idle instances</li>
        <li><strong>Idle resource savings</strong> — from resources that were flagged and decommissioned</li>
        <li><strong>Regression prevention</strong> — from cost spikes that were detected and resolved</li>
        <li><strong>Rightsizing</strong> — from instances that were downsized after utilisation analysis</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="date-range">Setting your date range</SectionAnchor>
      <p style={body}>Most dashboard pages have a date range picker in the top-right corner. You can select:</p>
      <ul style={listStyle}>
        <li>Last 7 days, 30 days, or 90 days</li>
        <li>Current month (month-to-date)</li>
        <li>Custom date range</li>
      </ul>
      <p style={body}>The date range affects all charts, tables, and KPI cards on the page. It does not affect ongoing monitoring or alert thresholds.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          COST REGRESSIONS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="what-is-regression">What is a regression?</SectionAnchor>
      <p style={body}>A cost regression is a statistically significant increase in cloud spend for a given service that exceeds your established baseline. Regressions are typically caused by:</p>
      <ul style={listStyle}>
        <li>A code deploy that introduced an inefficiency (e.g. a Lambda function with an infinite retry loop)</li>
        <li>A configuration change that increased resource consumption (e.g. increasing instance count in an autoscaling group)</li>
        <li>An unexpected traffic spike that triggered unintended scaling</li>
        <li>A new resource being provisioned and left running</li>
      </ul>
      <p style={body}>Cloudlink detects regressions by comparing your current spend rate against a rolling 30-day baseline for each individual service. A spike of more than 20% above baseline triggers an alert.</p>

      <hr style={divider} />

      <SectionAnchor id="regression-detection">How detection works</SectionAnchor>
      <p style={body}>Cloudlink runs cost analysis every hour using data from AWS Cost Explorer and CloudWatch. The detection algorithm:</p>
      <ol style={listStyle}>
        <li>Fetches the current hour's spend per service</li>
        <li>Computes a rolling 30-day baseline (median spend rate) for each service</li>
        <li>Flags any service where current spend exceeds <InlineCode>baseline × 1.20</InlineCode></li>
        <li>Checks recent deploy events to attribute the regression to a specific commit or deploy</li>
        <li>Calculates the projected monthly impact</li>
        <li>Creates a regression record and sends alerts</li>
      </ol>
      <p style={body}>Detection latency is typically under 2 hours from the time the regression begins.</p>

      <hr style={divider} />

      <SectionAnchor id="regression-alerts">Reading a regression alert</SectionAnchor>
      <p style={body}>Each regression alert includes:</p>
      <ul style={listStyle}>
        <li><strong>Service name</strong> — the AWS service or specific resource where the spike occurred</li>
        <li><strong>Delta</strong> — the percentage increase over baseline (e.g. +140%)</li>
        <li><strong>Monthly impact</strong> — projected cost increase per month if not resolved</li>
        <li><strong>Deploy attribution</strong> — if a deploy event was found within 4 hours of the spike, it is shown here with the commit SHA and author</li>
        <li><strong>Suggested action</strong> — a recommended fix generated by the AI analysis engine</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="regression-fixes">Approving and rejecting fixes</SectionAnchor>
      <p style={body}>For each regression, Cloudlink may suggest an automated fix. You can:</p>
      <ul style={listStyle}>
        <li><strong>Approve</strong> — Cloudlink will apply the fix automatically (e.g. stop an idle instance, revert a Lambda memory setting)</li>
        <li><strong>Reject</strong> — dismiss the suggestion without action</li>
        <li><strong>Mark resolved</strong> — if your team has already manually fixed the regression</li>
        <li><strong>Snooze</strong> — pause alerts for this regression for 24 hours</li>
      </ul>
      <p style={warn}><strong>Note:</strong> Cloudlink never applies changes to your infrastructure without explicit approval. Approval is logged with a timestamp and the user who approved it.</p>

      <hr style={divider} />

      <SectionAnchor id="regression-history">Regression history</SectionAnchor>
      <p style={body}>The <strong>Regressions → History</strong> tab shows all past regressions and their resolution status. For each regression you can see:</p>
      <ul style={listStyle}>
        <li>The service and timeframe of the regression</li>
        <li>Total cost impact (actual spend above baseline during the regression window)</li>
        <li>How it was resolved and by whom</li>
        <li>Whether the saving was credited to your monthly invoice</li>
      </ul>

      {/* ═══════════════════════════════════════════════════════════════════════
          RESOURCES & SCANNING
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="what-we-scan">What we scan for</SectionAnchor>
      <p style={body}>Every scan evaluates resources across several waste categories:</p>
      <ul style={listStyle}>
        <li><strong>Idle resources</strong> — running resources with no meaningful activity</li>
        <li><strong>Unattached resources</strong> — provisioned resources not attached to anything (e.g. unattached EBS volumes)</li>
        <li><strong>Over-provisioned resources</strong> — instances consistently using far less CPU or memory than their type provides</li>
        <li><strong>Stopped-but-not-terminated resources</strong> — EC2 instances that are stopped but still incurring EBS and Elastic IP charges</li>
        <li><strong>Public S3 buckets</strong> — buckets with public access that may be incurring egress charges</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="ec2-compute">EC2 and compute</SectionAnchor>
      <p style={body}>For EC2 instances, Cloudlink analyses:</p>
      <ul style={listStyle}>
        <li><strong>CPU utilisation</strong> — instances with average CPU below 5% for 7+ days are flagged as idle</li>
        <li><strong>Network I/O</strong> — instances with near-zero network activity are flagged regardless of CPU</li>
        <li><strong>Instance age</strong> — instances older than 90 days with no naming convention are flagged for review</li>
        <li><strong>Rightsizing opportunities</strong> — instances consistently using less than 20% of their type's CPU/RAM ceiling</li>
      </ul>
      <p style={body}>Cloudlink only recommends stopping or rightsizing — it will never terminate an instance without explicit approval.</p>

      <hr style={divider} />

      <SectionAnchor id="ebs-storage">EBS and storage</SectionAnchor>
      <p style={body}>EBS volumes incur charges regardless of whether they are attached to an instance. Cloudlink flags:</p>
      <ul style={listStyle}>
        <li><strong>Unattached volumes</strong> — volumes with <InlineCode>state=available</InlineCode> (not attached to any instance)</li>
        <li><strong>Volumes attached to stopped instances</strong> — you're still paying for these</li>
        <li><strong>Old snapshots</strong> — EBS snapshots older than 180 days that have no corresponding active volume</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="lambda-functions">Lambda functions</SectionAnchor>
      <p style={body}>For Lambda functions, Cloudlink analyses:</p>
      <ul style={listStyle}>
        <li><strong>Zero invocations</strong> — functions with no invocations in 30+ days</li>
        <li><strong>Memory over-provisioning</strong> — functions consistently using less than 30% of their allocated memory</li>
        <li><strong>Throttling patterns</strong> — functions with high throttle rates that may indicate concurrency misconfigurations</li>
        <li><strong>Cost regressions</strong> — sudden spikes in Lambda duration or invocation count</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="rds-databases">RDS and databases</SectionAnchor>
      <p style={body}>RDS instances are often one of the largest line items on a cloud bill. Cloudlink identifies:</p>
      <ul style={listStyle}>
        <li><strong>Idle databases</strong> — RDS instances with near-zero connections for 14+ days</li>
        <li><strong>Stopped databases</strong> — RDS instances in stopped state (they resume billing after 7 days automatically)</li>
        <li><strong>Single-AZ production databases</strong> — a reliability and cost flag (no HA surcharge, but potential incident risk)</li>
        <li><strong>Oversized instances</strong> — databases using less than 10% of available CPU/memory</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="s3-buckets">S3 buckets</SectionAnchor>
      <p style={body}>S3 costs are driven by storage size and egress. Cloudlink identifies:</p>
      <ul style={listStyle}>
        <li><strong>Buckets with no lifecycle policy</strong> — objects accumulate indefinitely with no automatic cleanup</li>
        <li><strong>High-egress buckets</strong> — buckets generating significant cross-region or internet egress charges</li>
        <li><strong>Publicly accessible buckets</strong> — potential security and cost issue if accessed externally</li>
        <li><strong>Buckets with Intelligent-Tiering potential</strong> — large buckets with mixed access patterns that could save with S3 Intelligent-Tiering</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="autostopping">AutoStopping</SectionAnchor>
      <p style={body}>AutoStopping automatically stops idle development and staging resources on a schedule or based on inactivity signals.</p>
      <p style={body}>How it works:</p>
      <ol style={listStyle}>
        <li>You create an AutoStop rule targeting a resource or tag group (e.g. <InlineCode>Environment=staging</InlineCode>)</li>
        <li>Cloudlink monitors the resources for inactivity signals (no SSH sessions, no HTTP traffic, CPU below threshold)</li>
        <li>When the inactivity threshold is reached, Cloudlink stops the resources and logs the action</li>
        <li>Resources restart instantly when traffic resumes or can be manually started from the dashboard</li>
      </ol>
      <p style={note}><strong style={{ color: C.green }}>Important:</strong> AutoStopping is designed for non-production workloads only. Always exclude production resources from AutoStop rules by using environment tags.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          SAVINGS & BILLING
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="savings-calculation">How savings are calculated</SectionAnchor>
      <p style={body}>Cloudlink tracks two categories of verified savings:</p>
      <h3 style={h3}>1. Direct action savings</h3>
      <p style={body}>These are savings from actions Cloudlink took directly or that you approved through the dashboard:</p>
      <ul style={listStyle}>
        <li>AutoStopping an idle dev/staging environment</li>
        <li>Deleting an unattached EBS volume</li>
        <li>Stopping an idle EC2 instance</li>
        <li>Fixing an over-provisioned Lambda function</li>
      </ul>
      <p style={body}><strong>Calculation:</strong> We record the resource cost before the action and subtract the cost after. The difference is your saving.</p>
      <h3 style={h3}>2. Regression prevention savings</h3>
      <p style={body}>These are savings from cost regressions that Cloudlink detected and your team resolved:</p>
      <ul style={listStyle}>
        <li>A deploy that caused a 40% cost spike, which your team reverted after Cloudlink alerted them</li>
      </ul>
      <p style={body}><strong>Calculation:</strong> We compare actual spend against your 30-day rolling baseline for that service. Spend above baseline that was reduced after a Cloudlink alert counts as a prevented regression cost.</p>
      <h3 style={h3}>What we do NOT count</h3>
      <ul style={listStyle}>
        <li>General cloud cost reductions unrelated to Cloudlink actions or alerts</li>
        <li>Savings from resources you fixed before Cloudlink flagged them</li>
        <li>Normal seasonal spend variations</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="what-counts">What counts as a saving</SectionAnchor>
      <p style={body}>A saving is logged when one of the following occurs:</p>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '4px 0', marginBottom: '16px' }}>
        {[
          { tag: 'AUTOSTOP', color: C.green, desc: 'Cloudlink stopped an idle resource. Saving = hourly_rate × hours_stopped' },
          { tag: 'IDLE_RESOURCE', color: '#F59E0B', desc: 'An idle/unattached resource was decommissioned. Saving = monthly_resource_cost' },
          { tag: 'REGRESSION_PREVENTION', color: '#3B82F6', desc: 'A cost regression was detected and resolved. Saving = actual_spend − baseline_spend' },
          { tag: 'RIGHTSIZING', color: '#A78BFA', desc: 'An instance was downsized based on utilisation data. Saving = cost_before − cost_after' },
        ].map((row) => (
          <div key={row.tag} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Tag color={row.color}>{row.tag}</Tag>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textSecondary, paddingTop: '2px' }}>{row.desc}</span>
          </div>
        ))}
      </div>

      <hr style={divider} />

      <SectionAnchor id="commission">The 15% commission</SectionAnchor>
      <p style={body}>Cloudlink charges 15% of your total verified savings each month. This commission only applies to savings that:</p>
      <ul style={listStyle}>
        <li>Were detected and attributed to a Cloudlink action or alert</li>
        <li>Are verifiable from your cloud billing data</li>
        <li>Occurred within the billing month being invoiced</li>
      </ul>
      <p style={body}>The commission is calculated on gross savings, before any Cloudlink fee. So if Cloudlink saves you $10,000, your invoice is $1,500 and you net $8,500.</p>

      <hr style={divider} />

      <SectionAnchor id="invoices">Monthly invoices</SectionAnchor>
      <p style={body}>Invoices are generated on the 1st of each month for the previous month's savings. Each invoice includes:</p>
      <ul style={listStyle}>
        <li>A line-by-line breakdown of every saving event counted in the month</li>
        <li>The type, date, resource, and dollar amount of each saving</li>
        <li>Total verified savings for the month</li>
        <li>The 15% commission amount</li>
        <li>Any rolled-over savings from prior months that brought you above the $500 threshold</li>
      </ul>
      <p style={body}>Invoices are sent to the billing email on your account and are available in <strong>Settings → Billing</strong>.</p>

      <hr style={divider} />

      <SectionAnchor id="minimum-threshold">The $500 minimum threshold</SectionAnchor>
      <p style={body}>Cloudlink only invoices you when your accumulated verified savings reach $500 or more in a billing month. This is to avoid billing you for trivial amounts and to reduce invoice overhead for smaller accounts.</p>
      <p style={body}>If your savings for a month are below $500, they roll over to the next month and accumulate. You will be invoiced when the cumulative total reaches $500.</p>
      <p style={note}><strong style={{ color: C.green }}>Example:</strong> You save $300 in January and $350 in February. The $300 rolls over, and in February you invoice on $650 total — a fee of $97.50.</p>

      <hr style={divider} />

      <SectionAnchor id="disputes">Disputing a charge</SectionAnchor>
      <p style={body}>If you believe a saving has been incorrectly logged or attributed, you can dispute it directly from your invoice:</p>
      <ol style={listStyle}>
        <li>Go to <strong>Settings → Billing → Invoices</strong></li>
        <li>Find the saving event you want to dispute and click <strong>Dispute</strong></li>
        <li>Enter the reason for your dispute</li>
        <li>Our team reviews disputes within 2 business days and responds via email</li>
      </ol>
      <p style={body}>Disputed savings are held from that month's invoice until resolved. If the dispute is upheld, the saving is removed from your total and you are credited accordingly.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          SDK REFERENCE
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="sdk-installation">SDK — Installation</SectionAnchor>
      <p style={body}>The Cloudlink SDK allows you to attribute cloud costs to individual customers, features, or business units — without requiring perfect AWS tagging.</p>
      <CodeBlock language="bash">{`# Python
pip install cloudlink-sdk

# Node.js / TypeScript
npm install @cloudlink/sdk`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="sdk-quickstart">SDK — Quick start</SectionAnchor>
      <CodeBlock language="python">{`from cloudlink import Cloudlink

# Initialise the client with your API key
cl = Cloudlink(api_key="cl_live_your_api_key_here")

# Track a unit of cost against a customer
cl.track(
    customer_id="customer_abc123",
    event="api_request",
    metadata={
        "feature": "data_export",
        "region": "us-east-1",
        "model": "gpt-4o",  # optional: useful for AI cost attribution
    }
)

print("Cost event tracked successfully")`}</CodeBlock>
      <CodeBlock language="typescript">{`import { Cloudlink } from '@cloudlink/sdk';

const cl = new Cloudlink({ apiKey: 'cl_live_your_api_key_here' });

// Track a cost event
await cl.track({
  customerId: 'customer_abc123',
  event: 'api_request',
  metadata: {
    feature: 'data_export',
    region: 'us-east-1',
  },
});`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="sdk-tracking">Tracking unit costs</SectionAnchor>
      <p style={body}>Use the SDK to attribute cloud costs to the specific customers and features driving them. This enables the <strong>Unit Economics</strong> dashboard to show you cost-per-customer and cost-per-feature breakdowns.</p>
      <CodeBlock language="python">{`# Track with explicit cost attribution
cl.track(
    customer_id="customer_abc123",
    event="model_inference",
    cost_usd=0.00042,       # optional: provide if you know the exact cost
    metadata={
        "feature": "ai_summarisation",
        "model": "claude-3-5-sonnet",
        "input_tokens": 1200,
        "output_tokens": 340,
    }
)

# Bulk track multiple events
cl.track_batch([
    {"customer_id": "cust_001", "event": "api_request", "metadata": {"feature": "export"}},
    {"customer_id": "cust_002", "event": "api_request", "metadata": {"feature": "search"}},
    {"customer_id": "cust_003", "event": "model_inference", "metadata": {"feature": "ai_summarisation"}},
])`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="sdk-fastapi">FastAPI middleware</SectionAnchor>
      <p style={body}>Add Cloudlink cost tracking to every FastAPI endpoint automatically using the middleware:</p>
      <CodeBlock language="python">{`from fastapi import FastAPI
from cloudlink.middleware.fastapi import CloudlinkMiddleware

app = FastAPI()

# Add the middleware — tracks cost for every request
app.add_middleware(
    CloudlinkMiddleware,
    api_key="cl_live_your_api_key_here",
    # Extract customer ID from the Authorization header (JWT sub claim)
    customer_id_extractor=lambda request: request.state.user_id,
    # Map URL paths to feature names
    feature_map={
        "/api/v1/export": "data_export",
        "/api/v1/search": "search",
        "/api/v1/ai/summarise": "ai_summarisation",
    },
)

@app.get("/api/v1/export")
async def export_data():
    # Cost is tracked automatically — no manual tracking needed
    return {"status": "ok"}`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="sdk-django">Django middleware</SectionAnchor>
      <CodeBlock language="python">{`# settings.py
MIDDLEWARE = [
    "cloudlink.middleware.django.CloudlinkMiddleware",
    # ... your other middleware
]

CLOUDLINK = {
    "API_KEY": "cl_live_your_api_key_here",
    "CUSTOMER_ID_HEADER": "X-Customer-Id",  # or extract from JWT
    "FEATURE_MAP": {
        "/api/export/": "data_export",
        "/api/search/": "search",
    },
}`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="sdk-config">Configuration options</SectionAnchor>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        {[
          { option: 'api_key', type: 'string', desc: 'Required. Your Cloudlink API key from Settings → API Keys.' },
          { option: 'batch_size', type: 'int', default: '100', desc: 'Number of events to batch before flushing to the API.' },
          { option: 'flush_interval', type: 'float', default: '5.0', desc: 'Seconds between automatic flushes (set to 0 to disable).' },
          { option: 'timeout', type: 'float', default: '3.0', desc: 'HTTP request timeout in seconds.' },
          { option: 'debug', type: 'bool', default: 'False', desc: 'Enable debug logging.' },
        ].map((row, i, arr) => (
          <div key={row.option} style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'flex-start' }}>
            <div style={{ minWidth: '140px' }}><InlineCode>{row.option}</InlineCode></div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textSecondary, flex: 1 }}>
              <span style={{ color: '#A78BFA', marginRight: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{row.type}</span>
              {row.default && <><InlineCode>{row.default}</InlineCode> &nbsp;</>}
              {row.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          API REFERENCE
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="api-auth">API — Authentication</SectionAnchor>
      <p style={body}>All API requests must include your API key in the Authorization header:</p>
      <CodeBlock language="bash">{`curl https://api.cloudlinkglobal.com/v1/costs \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
      <p style={body}>API keys can be generated in <strong>Settings → API Keys</strong>. Keep your API key secret — do not expose it in client-side code or public repositories.</p>
      <p style={note}><strong style={{ color: C.green }}>Security tip:</strong> Use environment variables to store API keys. Never commit them to version control. Rotate keys immediately if you suspect they have been exposed.</p>

      <hr style={divider} />

      <SectionAnchor id="api-base-url">Base URL and versioning</SectionAnchor>
      <p style={body}>All API endpoints are versioned and served from a single base URL:</p>
      <CodeBlock>{`Base URL: https://api.cloudlinkglobal.com/v1`}</CodeBlock>
      <p style={body}>All responses are JSON. All timestamps are ISO 8601 in UTC. The API version is included in the URL path — we will maintain backward compatibility within a major version and provide advance notice before any breaking changes.</p>

      <hr style={divider} />

      <SectionAnchor id="api-rate-limits">Rate limits</SectionAnchor>
      <p style={body}>API requests are rate limited per API key:</p>
      <ul style={listStyle}>
        <li><strong>Standard:</strong> 1,000 requests per hour</li>
        <li><strong>Burst:</strong> 100 requests per minute</li>
      </ul>
      <p style={body}>Rate limit headers are included in every response:</p>
      <CodeBlock>{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1704067200`}</CodeBlock>
      <p style={body}>When rate limited, the API returns HTTP 429 with a <InlineCode>Retry-After</InlineCode> header indicating how many seconds to wait before retrying.</p>

      <hr style={divider} />

      <SectionAnchor id="api-dashboard">Endpoints — Dashboard</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/v1/costs" desc="Total cloud spend and trend data for connected accounts" />
        <EndpointRow method="GET" path="/v1/costs/by-service" desc="Cost breakdown by AWS/GCP/Azure service" />
        <EndpointRow method="GET" path="/v1/costs/by-account" desc="Cost breakdown by connected cloud account" />
        <EndpointRow method="GET" path="/v1/summary" desc="High-level KPI summary (savings, regressions, idle resources)" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-regressions">Endpoints — Regressions</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/v1/regressions" desc="List all detected cost regressions" />
        <EndpointRow method="GET" path="/v1/regressions/{id}" desc="Get details for a specific regression" />
        <EndpointRow method="POST" path="/v1/regressions/{id}/resolve" desc="Mark a regression as resolved" />
        <EndpointRow method="POST" path="/v1/regressions/{id}/approve-fix" desc="Approve the suggested automated fix" />
        <EndpointRow method="POST" path="/v1/deploys" desc="Record a deploy event for regression attribution" />
      </EndpointTable>
      <p style={body}>Recording deploy events enables Cloudlink to attribute regressions to specific commits:</p>
      <CodeBlock language="bash">{`# Called from your CI/CD pipeline after a successful deploy
curl -X POST https://api.cloudlinkglobal.com/v1/deploys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "payments-api",
    "environment": "production",
    "version": "v2.14.1",
    "commit_sha": "a3f8c1d",
    "author": "platform@acme.dev",
    "deployed_at": "2025-03-15T14:32:00Z"
  }'`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="api-resources">Endpoints — Resources</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/v1/resources" desc="List all scanned resources across connected accounts" />
        <EndpointRow method="GET" path="/v1/resources/idle" desc="List resources flagged as idle or underutilised" />
        <EndpointRow method="GET" path="/v1/resources/{id}" desc="Get details for a specific resource" />
        <EndpointRow method="POST" path="/v1/autostop/rules" desc="Create an AutoStop rule" />
        <EndpointRow method="GET" path="/v1/autostop/rules" desc="List all AutoStop rules" />
        <EndpointRow method="DELETE" path="/v1/autostop/rules/{id}" desc="Delete an AutoStop rule" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-savings">Endpoints — Savings</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/v1/savings" desc="List all logged saving events" />
        <EndpointRow method="GET" path="/v1/savings/summary" desc="Aggregated savings summary for the current billing period" />
        <EndpointRow method="POST" path="/v1/savings/log" desc="Manually log a saving event" />
        <EndpointRow method="GET" path="/v1/savings/disputes" desc="List all saving disputes" />
        <EndpointRow method="POST" path="/v1/savings/disputes" desc="Open a dispute on a saving event" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-errors">Error codes</SectionAnchor>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { code: '400', label: 'Bad Request', desc: 'The request body or parameters are invalid. Check the error.message field for details.' },
          { code: '401', label: 'Unauthorized', desc: 'Missing or invalid API key. Ensure your Authorization header is correct.' },
          { code: '403', label: 'Forbidden', desc: 'Your API key does not have permission for this operation.' },
          { code: '404', label: 'Not Found', desc: 'The requested resource does not exist.' },
          { code: '409', label: 'Conflict', desc: 'The request conflicts with existing state (e.g. duplicate saving event).' },
          { code: '429', label: 'Rate Limited', desc: 'You have exceeded the rate limit. See the Retry-After header.' },
          { code: '500', label: 'Internal Server Error', desc: 'An unexpected error occurred on our end. Contact support if this persists.' },
        ].map((row, i, arr) => (
          <div key={row.code} style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 700, color: parseInt(row.code) >= 500 ? '#EF4444' : parseInt(row.code) >= 400 ? '#F59E0B' : C.green, minWidth: '36px' }}>{row.code}</span>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: C.textPrimary, marginBottom: '2px' }}>{row.label}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textMuted }}>{row.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MCP SERVER
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="mcp-overview">What is the MCP server?</SectionAnchor>
      <p style={body}>Cloudlink exposes your cost data as tools via the Model Context Protocol (MCP). This allows AI coding assistants like Claude and Cursor to answer questions about your cloud costs directly in your editor — without switching tabs.</p>
      <p style={body}>Example queries you can ask your AI assistant:</p>
      <ul style={listStyle}>
        <li>"What caused last week's spike in Lambda costs?"</li>
        <li>"Which service is trending up most this month?"</li>
        <li>"Show me my top 5 most wasteful resources right now"</li>
        <li>"What would my bill look like if I stopped these three EC2 instances?"</li>
        <li>"Are there any active cost regressions I should know about?"</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="mcp-claude">Connecting to Claude</SectionAnchor>
      <p style={body}>Add the Cloudlink MCP server to your Claude Desktop configuration:</p>
      <CodeBlock language="json">{`// ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "cloudlink": {
      "command": "npx",
      "args": ["@cloudlink/mcp-server"],
      "env": {
        "CLOUDLINK_API_KEY": "cl_live_your_api_key_here"
      }
    }
  }
}`}</CodeBlock>
      <p style={body}>Restart Claude Desktop after adding the configuration. You should see the Cloudlink tools listed in the Claude tools panel.</p>

      <hr style={divider} />

      <SectionAnchor id="mcp-cursor">Connecting to Cursor</SectionAnchor>
      <p style={body}>Add the MCP server to your Cursor configuration file:</p>
      <CodeBlock language="json">{`// .cursor/mcp.json (in your project root or home directory)
{
  "mcpServers": {
    "cloudlink": {
      "command": "npx",
      "args": ["@cloudlink/mcp-server"],
      "env": {
        "CLOUDLINK_API_KEY": "cl_live_your_api_key_here"
      }
    }
  }
}`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="mcp-tools">Available tools</SectionAnchor>
      <p style={body}>The Cloudlink MCP server exposes the following tools to your AI assistant:</p>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { tool: 'get_cost_summary', desc: 'Returns total cloud spend, savings, and active regressions for the current period.' },
          { tool: 'list_regressions', desc: 'Lists all active cost regressions with severity, impact, and attribution.' },
          { tool: 'list_idle_resources', desc: 'Returns idle and underutilised resources sorted by monthly cost impact.' },
          { tool: 'get_service_costs', desc: 'Returns cost breakdown by cloud service for a given date range.' },
          { tool: 'get_savings_summary', desc: 'Returns verified savings by category for the current billing period.' },
          { tool: 'get_autostop_savings', desc: 'Returns savings generated by AutoStop actions.' },
        ].map((row, i, arr) => (
          <div key={row.tool} style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
            <div style={{ minWidth: '180px' }}><InlineCode>{row.tool}</InlineCode></div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textSecondary, flex: 1 }}>{row.desc}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          INTEGRATIONS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="slack-alerts">Slack alerts</SectionAnchor>
      <p style={body}>Connect Slack to receive real-time cost alerts in your engineering channels.</p>
      <SubAnchor id="slack-setup">Setup</SubAnchor>
      <ol style={listStyle}>
        <li>Go to <strong>Settings → Notifications → Slack</strong></li>
        <li>Click <strong>Connect Slack</strong> and authorise the Cloudlink app in your Slack workspace</li>
        <li>Select the channel where alerts should be sent</li>
        <li>Click <strong>Save</strong></li>
      </ol>
      <SubAnchor id="slack-alert-format">Alert format</SubAnchor>
      <p style={body}>Every Slack alert includes:</p>
      <ul style={listStyle}>
        <li>The affected service name and environment</li>
        <li>The deploy that caused it (if applicable), including commit SHA and author</li>
        <li>The cost delta (% change and absolute $ amount)</li>
        <li>The estimated monthly impact</li>
        <li>A direct link to view the full regression in Cloudlink</li>
        <li>Approve / Reject buttons for suggested fixes (Slack Actions)</li>
      </ul>
      <SubAnchor id="slack-thresholds">Alert thresholds</SubAnchor>
      <p style={body}>You can configure alert thresholds in <strong>Settings → Notifications → Slack</strong>. Only send alerts when:</p>
      <ul style={listStyle}>
        <li>The cost impact exceeds a configurable threshold (default: $100/month)</li>
        <li>The regression severity is above a configurable level (low / medium / high / critical)</li>
        <li>Specific services or environments are affected</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="github-integration">GitHub PR comments</SectionAnchor>
      <p style={body}>Cloudlink can post a cost impact comment on every pull request, showing the estimated cloud cost change the PR is likely to introduce based on historical data from similar changes.</p>
      <SubAnchor id="github-setup">Setup</SubAnchor>
      <ol style={listStyle}>
        <li>Install the Cloudlink GitHub App from <strong>Settings → Integrations → GitHub</strong></li>
        <li>Authorise the app on your GitHub organisation</li>
        <li>Select which repositories should receive PR cost comments</li>
      </ol>
      <SubAnchor id="github-cicd">CI/CD webhook</SubAnchor>
      <p style={body}>For deploy attribution to work, add a step to your GitHub Actions workflow that notifies Cloudlink after each deploy:</p>
      <CodeBlock language="yaml">{`# .github/workflows/deploy.yml
- name: Notify Cloudlink of deploy
  if: success()
  run: |
    curl -s -X POST \${{ secrets.CLOUDLINK_API_URL }}/v1/deploys \\
      -H "Authorization: Bearer \${{ secrets.CLOUDLINK_API_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "service": "\${{ github.event.repository.name }}",
        "environment": "production",
        "commit_sha": "\${{ github.sha }}",
        "author": "\${{ github.actor }}",
        "version": "\${{ github.ref_name }}"
      }'`}</CodeBlock>

      <hr style={divider} />

      <SectionAnchor id="email-notifications">Email notifications</SectionAnchor>
      <p style={body}>Email notifications are sent automatically to the account owner for:</p>
      <ul style={listStyle}>
        <li>New critical regressions (cost spike over 100% or $5,000+ monthly impact)</li>
        <li>Monthly savings reports</li>
        <li>Invoice generation</li>
        <li>Dispute resolution updates</li>
      </ul>
      <p style={body}>You can configure additional recipients and adjust notification preferences in <strong>Settings → Notifications → Email</strong>.</p>

      <hr style={divider} />

      <SectionAnchor id="webhooks">Webhooks</SectionAnchor>
      <p style={body}>Cloudlink can send webhook events to any HTTP endpoint when important events occur. This allows you to integrate cost events into your own tooling (PagerDuty, JIRA, custom dashboards, etc.).</p>
      <SubAnchor id="webhook-events">Supported events</SubAnchor>
      <ul style={listStyle}>
        <li><InlineCode>regression.created</InlineCode> — new cost regression detected</li>
        <li><InlineCode>regression.resolved</InlineCode> — regression marked as resolved</li>
        <li><InlineCode>saving.logged</InlineCode> — new saving event recorded</li>
        <li><InlineCode>resource.idle_detected</InlineCode> — idle resource found</li>
        <li><InlineCode>invoice.generated</InlineCode> — monthly invoice created</li>
      </ul>
      <SubAnchor id="webhook-payload">Webhook payload</SubAnchor>
      <CodeBlock language="json">{`{
  "event": "regression.created",
  "timestamp": "2025-03-15T14:32:00Z",
  "data": {
    "regression_id": "reg_abc123",
    "service": "payments-lambda",
    "environment": "production",
    "delta_pct": 142,
    "monthly_impact_usd": 2840,
    "attributed_deploy": {
      "commit_sha": "a3f8c1d",
      "author": "platform@acme.dev",
      "deployed_at": "2025-03-15T12:00:00Z"
    }
  }
}`}</CodeBlock>
      <SubAnchor id="webhook-security">Webhook security</SubAnchor>
      <p style={body}>Every webhook request includes a signature header for verification:</p>
      <CodeBlock language="python">{`import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """Verify the Cloudlink webhook signature."""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)`}</CodeBlock>

      {/* Footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', marginTop: '40px', borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textMuted }}>
          Cloudlink Docs · <Link href="/signup" style={{ color: C.green, textDecoration: 'none' }}>Start for free →</Link>
        </span>
        <Link href="mailto:support@cloudlinkglobal.com" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.green, textDecoration: 'none' }}>
          support@cloudlinkglobal.com
        </Link>
      </div>

    </article>
  )
}
