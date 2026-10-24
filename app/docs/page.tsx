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

const API_BASE = 'https://cloudlink-agents.onrender.com'
const CONTACT = 'satvikranga60@gmail.com'

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

function KeyValueTable({ rows, keyWidth = '180px' }: { rows: { k: string; v: string }[]; keyWidth?: string }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
      {rows.map((row, i, arr) => (
        <div key={row.k} style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
          <div style={{ minWidth: keyWidth }}><InlineCode>{row.k}</InlineCode></div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textSecondary, flex: 1 }}>{row.v}</div>
        </div>
      ))}
    </div>
  )
}

const PERMISSIONS = `ec2:DescribeInstances
ec2:DescribeInstanceStatus
ec2:DescribeSecurityGroups
ec2:DescribeVpcs
ec2:DescribeSubnets
ec2:DescribeVolumes
ec2:DescribeRegions
ec2:DescribeTags
cloudwatch:GetMetricStatistics
cloudwatch:ListMetrics
ce:GetCostAndUsage
ce:GetCostForecast
s3:ListAllMyBuckets
s3:GetBucketLocation
s3:GetBucketPublicAccessBlock
s3:GetBucketEncryption
s3:GetBucketVersioning
s3:GetBucketAcl
rds:DescribeDBInstances
rds:DescribeDBClusters
lambda:ListFunctions
sts:GetCallerIdentity`

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
          How to connect an AWS account, what Cloudlink checks, and how to use the API.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          GETTING STARTED
      ═══════════════════════════════════════════════════════════════════════ */}

      <SectionAnchor id="what-is-cloudlink">What is Cloudlink?</SectionAnchor>
      <p style={body}>
        Cloudlink is a cost monitoring tool for AWS. You connect an AWS account by deploying a CloudFormation template that creates one read-only IAM role. Cloudlink then scans the account on a schedule, records your AWS costs by service, and reports what it finds: idle or unattached resources, risky settings, and cost increases.
      </p>
      <p style={body}>
        Findings come with a recommendation and, where Cloudlink can estimate one, a monthly saving. Your team decides what to change and makes the change in AWS. Cloudlink does not change anything in your account.
      </p>
      <p style={body}>
        Cloudlink can also compare a service&apos;s cost before and after a deploy event you send from CI, so a cost increase can be tied to the deploy that came before it. That feature is still in development; see <a href="#cost-data" style={{ color: C.green }}>Cost data</a>.
      </p>

      <hr style={divider} />

      <SectionAnchor id="what-it-covers">What Cloudlink covers today</SectionAnchor>
      <p style={body}>Cloudlink works with AWS only. In each connected account it checks:</p>
      <ul style={listStyle}>
        <li><strong>EC2 instances</strong> — running instances with low average CPU over the last 7 days (from CloudWatch)</li>
        <li><strong>EBS volumes</strong> — volumes that are not attached to any instance</li>
        <li><strong>RDS database instances</strong> — stopped, publicly accessible, unencrypted, no automated backups, or not Multi-AZ</li>
        <li><strong>Lambda functions</strong> — function settings (runtime, memory, timeout), deprecated runtimes, and functions with no invocations in the last 14 days</li>
        <li><strong>S3 buckets</strong> — bucket-level settings only: public access block, default encryption, and versioning</li>
        <li><strong>Security groups</strong> — inbound rules that open common admin and database ports to the whole internet</li>
        <li><strong>AWS cost by service</strong> — from Cost Explorer: month-to-date totals, plus hourly per-service costs that serve as the baseline for spotting cost increases</li>
      </ul>
      <p style={body}><strong>Not covered yet:</strong> VPC/NAT gateways, load balancers, DynamoDB, Kinesis, ElastiCache, OpenSearch, Bedrock.</p>
      <p style={note}><strong style={{ color: C.green }}>Read-only:</strong> Cloudlink is read-only and never changes anything in your account. See <a href="#read-only" style={{ color: C.green }}>Read-only by design</a>.</p>

      <hr style={divider} />

      <SectionAnchor id="read-only">Read-only by design</SectionAnchor>
      <ul style={listStyle}>
        <li>The IAM role Cloudlink uses allows 22 actions, and every one is a Describe, Get or List call. It has no write permissions and no <InlineCode>s3:GetObject</InlineCode>, so Cloudlink cannot read the contents of your buckets. The full list is in <a href="#aws-permissions" style={{ color: C.green }}>Permissions</a>.</li>
        <li>The role can only be assumed by Cloudlink&apos;s AWS account, and only with the External ID you choose when you deploy the stack.</li>
        <li>The Cloudlink API runs in read-only mode. Requests that would change a resource, such as approving or running an action, AutoStop runs, or starting and stopping a resource, are refused with HTTP 403.</li>
        <li>Cloudlink&apos;s test suite checks the CloudFormation template and fails if common write actions (for example Put, Delete, Start, Terminate or StopInstances) or <InlineCode>s3:GetObject</InlineCode> appear in it.</li>
        <li>You can cut off access at any time by deleting the CloudFormation stack in your AWS account.</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="how-pricing-works">Pricing</SectionAnchor>
      <p style={body}>
        Cloudlink&apos;s fee is 15% of verified savings. If there are no verified savings, there is no fee. The fall 2026 pilot is free. See the <Link href="/pricing" style={{ color: C.green }}>pricing page</Link> or the <Link href="/pilot" style={{ color: C.green }}>pilot page</Link>.
      </p>

      <hr style={divider} />

      <SectionAnchor id="quick-start">Quick start</SectionAnchor>
      <StepItem n={1} title="Create your account">
        <p style={body}>Sign up at <Link href="/signup" style={{ color: C.green }}>cloudlinkglobal.com/signup</Link>, or apply for the free pilot at <Link href="/pilot" style={{ color: C.green }}>cloudlinkglobal.com/pilot</Link>.</p>
      </StepItem>
      <StepItem n={2} title="Connect an AWS account">
        <p style={body}>Deploy the Cloudlink CloudFormation template in your AWS account and paste the role ARN into Cloudlink. See <a href="#connecting-aws" style={{ color: C.green }}>Connecting AWS</a>.</p>
      </StepItem>
      <StepItem n={3} title="Run a scan">
        <p style={body}>Click <strong>Scan</strong> next to the account on the <strong>Credentials</strong> page of the dashboard. After that, scans run automatically (every 30 minutes by default).</p>
      </StepItem>
      <StepItem n={4} title="Turn on alerts">
        <p style={body}>Add a Slack incoming webhook URL on the <strong>Webhooks</strong> page to get Slack messages for cost regressions and budget thresholds. See <a href="#slack-alerts" style={{ color: C.green }}>Slack alerts</a>.</p>
      </StepItem>
      <StepItem n={5} title="Send deploy events (optional)">
        <p style={body}>Add one step to your CI pipeline so Cloudlink can compare cost before and after each deploy. See the <Link href="/docs/ci-integration" style={{ color: C.green }}>CI integration guide</Link>.</p>
      </StepItem>

      <hr style={divider} />

      <SectionAnchor id="system-requirements">Requirements</SectionAnchor>
      <p style={body}>Cloudlink is hosted, so there is nothing to install. You need:</p>
      <ul style={listStyle}>
        <li>An AWS account, and permission to deploy a CloudFormation stack that creates an IAM role</li>
        <li>For cost-increase detection and budgets: hourly granularity turned on in Cost Explorer (see <a href="#cost-data" style={{ color: C.green }}>Cost data</a>)</li>
        <li>A current version of Chrome, Firefox, Safari or Edge for the dashboard</li>
      </ul>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONNECTING AWS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="connecting-aws">Connecting AWS</SectionAnchor>
      <p style={body}><strong>Prerequisites:</strong> permission to deploy CloudFormation stacks that create IAM roles in the AWS account you want to connect.</p>
      <StepItem n={1} title="Download the template">
        <p style={body}>In the dashboard, open <strong>Credentials</strong>, click <strong>+ Add credential</strong>, and download <InlineCode>cloudlink-role.yaml</InlineCode>. The same file is available at:</p>
        <CodeBlock>{`${API_BASE}/setup/cloudformation-template`}</CodeBlock>
      </StepItem>
      <StepItem n={2} title="Deploy the stack">
        <p style={body}>Create a stack from the template in the AWS CloudFormation console. It asks for:</p>
        <ul style={listStyle}>
          <li><InlineCode>ExternalId</InlineCode> — a secret string you choose (8 to 128 characters). Keep it; you enter it in Cloudlink in step 4.</li>
          <li><InlineCode>RoleName</InlineCode> — defaults to <InlineCode>CloudlinkRole</InlineCode>.</li>
          <li><InlineCode>CloudlinkAccountId</InlineCode> — only shown if the template does not already include Cloudlink&apos;s AWS account ID. Use the 12-digit ID we give you during onboarding.</li>
        </ul>
        <p style={body}>The stack creates one IAM role. Its trust policy lets only Cloudlink&apos;s AWS account assume it, and only when the External ID matches. It has one inline policy, <InlineCode>CloudlinkReadOnly</InlineCode>, with the <a href="#aws-permissions" style={{ color: C.green }}>22 read-only actions</a> below. Sessions last at most one hour.</p>
      </StepItem>
      <StepItem n={3} title="Copy the role ARN">
        <p style={body}>When the stack is complete, copy <InlineCode>RoleArn</InlineCode> from the stack&apos;s <strong>Outputs</strong> tab.</p>
      </StepItem>
      <StepItem n={4} title="Save the credential in Cloudlink">
        <p style={body}>Back on the <strong>Credentials</strong> page, paste the role ARN and your External ID, and list the regions to scan (comma-separated). If you leave regions empty, only <InlineCode>us-east-1</InlineCode> is scanned. Click <strong>Save credential</strong>.</p>
      </StepItem>
      <StepItem n={5} title="Verify the connection">
        <p style={body}>Click <strong>Verify</strong>. Cloudlink assumes the role with your External ID and shows the AWS account identity it got back.</p>
      </StepItem>

      <hr style={divider} />

      <SectionAnchor id="aws-permissions">Permissions</SectionAnchor>
      <p style={body}>These are all of the actions in the role&apos;s policy. Each one is a Describe, Get or List call, on <InlineCode>Resource: &apos;*&apos;</InlineCode>.</p>
      <CodeBlock language="IAM actions">{PERMISSIONS}</CodeBlock>
      <p style={body}>
        A few of these are not used by the current scanner: <InlineCode>ec2:DescribeInstanceStatus</InlineCode>, <InlineCode>ec2:DescribeVpcs</InlineCode>, <InlineCode>ec2:DescribeSubnets</InlineCode>, <InlineCode>ec2:DescribeRegions</InlineCode>, <InlineCode>ec2:DescribeTags</InlineCode>, <InlineCode>cloudwatch:ListMetrics</InlineCode>, <InlineCode>s3:GetBucketAcl</InlineCode> and <InlineCode>rds:DescribeDBClusters</InlineCode>.
      </p>

      <hr style={divider} />

      <SectionAnchor id="managing-connections">Managing connections</SectionAnchor>
      <p style={body}>Connected AWS accounts are listed on the <strong>Credentials</strong> page. For each one you can:</p>
      <ul style={listStyle}>
        <li><strong>Verify</strong> — check that Cloudlink can still assume the role</li>
        <li><strong>Scan</strong> — start a scan now instead of waiting for the next scheduled one</li>
        <li><strong>Delete</strong> — remove the stored role ARN and External ID from Cloudlink</li>
      </ul>
      <p style={body}>To connect another AWS account, deploy the template in that account and add it as a second credential. Accounts in an AWS Organization are not discovered automatically; each one is connected separately.</p>
      <p style={body}>Deleting a credential in Cloudlink stops Cloudlink from using it. To revoke access from your side, delete the CloudFormation stack.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          RESOURCES & SCANNING
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="what-we-scan">How scanning works</SectionAnchor>
      <ul style={listStyle}>
        <li>Scans run on a schedule (every 30 minutes by default) and on demand, from the <strong>Scan</strong> button or <InlineCode>POST /scan</InlineCode>.</li>
        <li>EC2, EBS, RDS, Lambda and security groups are scanned only in the regions you listed for the credential. S3 and Cost Explorer are account-wide.</li>
        <li>Cloudlink stores the latest state of each resource it reports. You can see them on the <strong>Resources</strong> page or with <InlineCode>GET /resources</InlineCode>.</li>
      </ul>
      <p style={warn}><strong>AWS charges:</strong> AWS bills Cost Explorer API requests to the account being scanned (currently $0.01 per request). Each scan makes three Cost Explorer requests.</p>

      <hr style={divider} />

      <SectionAnchor id="ec2-compute">EC2 instances</SectionAnchor>
      <ul style={listStyle}>
        <li>Only running instances that have been up for at least 24 hours are checked. Stopped instances are not scanned.</li>
        <li>For each instance, Cloudlink reads the average <InlineCode>CPUUtilization</InlineCode> from CloudWatch over the last 7 days.</li>
        <li>An instance with an average below 5% is marked idle.</li>
        <li>Cloudlink also records the instance type, platform, monitoring state and tags.</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="ebs-storage">EBS volumes</SectionAnchor>
      <p style={body}>Cloudlink flags volumes in the <InlineCode>available</InlineCode> state, which means they are not attached to any instance but are still billed. For each one it records size, volume type, encryption and tags. EBS snapshots are not scanned.</p>

      <hr style={divider} />

      <SectionAnchor id="lambda-functions">Lambda functions</SectionAnchor>
      <ul style={listStyle}>
        <li>Cloudlink lists functions in each region and records runtime, memory, timeout and code size. It does not download function code.</li>
        <li>It flags functions with no invocations in the last 14 days (from the CloudWatch <InlineCode>Invocations</InlineCode> metric).</li>
        <li>It flags functions on deprecated runtimes, such as <InlineCode>python3.6</InlineCode> or <InlineCode>nodejs12.x</InlineCode>.</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="rds-databases">RDS databases</SectionAnchor>
      <p style={body}>For each RDS database instance, Cloudlink records the engine, instance class and status, and flags:</p>
      <ul style={listStyle}>
        <li>Stopped instances</li>
        <li>Instances that are publicly accessible</li>
        <li>Instances with unencrypted storage</li>
        <li>Instances with automated backups turned off</li>
        <li>Instances that are not Multi-AZ</li>
      </ul>
      <p style={body}>DB clusters are not checked separately.</p>

      <hr style={divider} />

      <SectionAnchor id="s3-buckets">S3 buckets</SectionAnchor>
      <p style={body}>Cloudlink checks bucket-level settings only. It never reads objects. It flags buckets where:</p>
      <ul style={listStyle}>
        <li>The public access block is missing or not fully turned on</li>
        <li>No default encryption is configured</li>
        <li>Versioning is not enabled</li>
      </ul>
      <p style={body}>Bucket policies, ACLs, bucket size and request or data-transfer charges are not checked yet.</p>

      <hr style={divider} />

      <SectionAnchor id="security-groups">Security groups</SectionAnchor>
      <p style={body}>Cloudlink flags security groups with inbound rules open to <InlineCode>0.0.0.0/0</InlineCode> or <InlineCode>::/0</InlineCode> that include port 22 (SSH), 3389 (RDP), 5432 (PostgreSQL), 3306 (MySQL) or 27017 (MongoDB). Rules that allow all protocols are not flagged yet.</p>

      <hr style={divider} />

      <SectionAnchor id="cost-data">Cost data</SectionAnchor>
      <p style={body}>On each scan, Cloudlink reads from Cost Explorer (unblended cost):</p>
      <ul style={listStyle}>
        <li>The month-to-date total for the account</li>
        <li>Month-to-date cost by service</li>
        <li>Hourly cost by service for the last 48 hours</li>
      </ul>
      <p style={body}>Hourly values are stored as one snapshot per service per hour. They are the baseline for <a href="#what-is-regression" style={{ color: C.green }}>cost regressions</a> and the spend figure for <a href="#budgets" style={{ color: C.green }}>budgets</a>. You can read them with <InlineCode>GET /cost-snapshots</InlineCode>.</p>
      <p style={warn}><strong>In development:</strong> scans read hourly costs but don&apos;t yet save them as snapshots automatically. Today, snapshots are only saved when cost data is sent to Cloudlink&apos;s ingest API, so cost-regression detection and budgets only work with ingested data. Automatic snapshots from scans are being built.</p>
      <p style={warn}><strong>Hourly granularity:</strong> AWS only returns hourly cost data if hourly granularity is turned on in your Cost Explorer preferences, and AWS charges for it. Without it, Cloudlink still reads month-to-date costs, but cost-regression detection and budgets have no data to work with.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          COST REGRESSIONS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="what-is-regression">What is a cost regression?</SectionAnchor>
      <p style={warn}><strong>In development.</strong> Regression detection depends on hourly cost snapshots, which scans don&apos;t save automatically yet (see <a href="#cost-data" style={{ color: C.green }}>Cost data</a>).</p>
      <p style={body}>A cost regression is a rise in a service&apos;s hourly cost right after a deploy. Cloudlink only looks for regressions around deploy events you send it (see the <Link href="/docs/ci-integration" style={{ color: C.green }}>CI integration guide</Link>). If you don&apos;t send deploy events, no regressions are created.</p>

      <hr style={divider} />

      <SectionAnchor id="regression-detection">How detection works</SectionAnchor>
      <p style={body}>Detection runs every 30 minutes by default. You can also run it from the <strong>Deploys</strong> page (<strong>Run detection</strong>) or with <InlineCode>POST /regression/run</InlineCode>. Each run:</p>
      <ol style={listStyle}>
        <li>Picks deploy events that are at least 2 hours old and have not been analysed yet</li>
        <li>Computes the baseline: the average hourly cost of the deploy&apos;s service in the snapshots from before the deploy hour</li>
        <li>Computes the post-deploy cost: the average hourly cost over up to three hours, starting the hour after the deploy</li>
        <li>If there is not enough data yet, leaves the deploy for the next run</li>
        <li>If the post-deploy cost is at least 10% above the baseline, creates an <InlineCode>open</InlineCode> regression</li>
      </ol>
      <p style={body}>Each regression records the baseline and post-deploy hourly cost, the percentage change, an estimated monthly impact of <InlineCode>(post − baseline) × 24 × 30</InlineCode>, and a confidence of <InlineCode>high</InlineCode> (increase of 20% or more) or <InlineCode>medium</InlineCode>. Deploys that stay under the threshold are saved as <InlineCode>resolved</InlineCode> with a 0% change, so filter with <InlineCode>?status=open</InlineCode> to see only real regressions.</p>
      <p style={warn}><strong>Service names must match:</strong> the <InlineCode>service</InlineCode> in a deploy event has to match a Cost Explorer service name exactly, for example <InlineCode>AWS Lambda</InlineCode>. Use <InlineCode>GET /cost-snapshots/services</InlineCode> to see the names Cloudlink has data for.</p>

      <hr style={divider} />

      <SectionAnchor id="regression-alerts">Regression alerts</SectionAnchor>
      <p style={body}>When a regression is created, Cloudlink sends a Slack message (if Slack is set up) and a <InlineCode>regression.detected</InlineCode> webhook to any webhook subscribed to that event. The Slack message shows:</p>
      <ul style={listStyle}>
        <li>The service</li>
        <li>The cost increase in percent</li>
        <li>The estimated monthly impact</li>
        <li>The confidence level</li>
        <li>The deploy&apos;s version and environment, and the deploy ID</li>
        <li>A link to the Regressions page in the dashboard</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="regression-status">Acknowledging and resolving</SectionAnchor>
      <p style={body}>A regression is <InlineCode>open</InlineCode>, <InlineCode>acknowledged</InlineCode> (your team is looking at it) or <InlineCode>resolved</InlineCode>. You can change the status on the <strong>Regressions</strong> page or with the API. Changing the status only updates Cloudlink&apos;s records. Cloudlink does not roll back deploys or apply fixes; your team does that.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          BUDGETS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="budgets">Budgets</SectionAnchor>
      <p style={body}>A budget is a monthly spending limit for the whole account or for one service. Create budgets on the <strong>Budgets</strong> page or with <InlineCode>POST /budgets</InlineCode>:</p>
      <CodeBlock language="json">{`{
  "name": "Lambda monthly",
  "monthly_limit_usd": 200,
  "scope": "service",
  "service": "AWS Lambda",
  "alert_thresholds": [50, 80, 100]
}`}</CodeBlock>
      <KeyValueTable rows={[
        { k: 'name', v: 'Required.' },
        { k: 'monthly_limit_usd', v: 'Required. Must be greater than 0.' },
        { k: 'scope', v: '"total" (default) for the whole account, or "service" for one service.' },
        { k: 'service', v: 'The Cost Explorer service name, when scope is "service".' },
        { k: 'alert_thresholds', v: 'Percentages of the limit that trigger an alert. Default [50, 80, 100].' },
      ]} />
      <p style={body}>Cloudlink checks budgets every hour. <InlineCode>POST /budgets/check</InlineCode> runs the same check right away. A check compares this month&apos;s spend against each enabled budget, and for each threshold that has been reached and has not already alerted this month, it:</p>
      <ul style={listStyle}>
        <li>Records an alert (see <InlineCode>GET /budgets/alerts</InlineCode>)</li>
        <li>Sends a <InlineCode>budget.threshold_reached</InlineCode> webhook</li>
        <li>Sends a Slack message, if Slack is set up</li>
      </ul>
      <p style={body}>Budgets only send alerts. They do not block deploys or stop resources.</p>
      <p style={body}>This month&apos;s spend is the sum of the hourly cost snapshots Cloudlink has stored for the month, so it can be lower than your AWS bill, for example if the account was connected partway through the month.</p>

      {/* ═══════════════════════════════════════════════════════════════════════
          API REFERENCE
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="api-auth">API — Authentication</SectionAnchor>
      <p style={body}>Send your API key as a bearer token in the <InlineCode>Authorization</InlineCode> header:</p>
      <CodeBlock language="bash">{`curl ${API_BASE}/stats \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
      <p style={body}>During the pilot, API keys are issued by the Cloudlink team. Email <a href={`mailto:${CONTACT}`} style={{ color: C.green }}>{CONTACT}</a> to request one. Every key belongs to one Cloudlink account and only sees that account&apos;s data.</p>
      <p style={body}><InlineCode>GET /health</InlineCode> and <InlineCode>GET /setup/cloudformation-template</InlineCode> do not need a key. Every other endpoint below does.</p>
      <p style={note}><strong style={{ color: C.green }}>Security tip:</strong> Keep API keys in environment variables or CI secrets. Never commit them to version control or put them in client-side code.</p>

      <hr style={divider} />

      <SectionAnchor id="api-base-url">Base URL</SectionAnchor>
      <CodeBlock>{API_BASE}</CodeBlock>
      <p style={body}>Most endpoints have no version prefix. A small set of read-only endpoints is also available under <InlineCode>/v1</InlineCode> (see <a href="#api-v1" style={{ color: C.green }}>Endpoints — v1</a>). Requests and responses are JSON.</p>
      <p style={body}>Request and response schemas are in the interactive API docs at <InlineCode>{`${API_BASE}/docs`}</InlineCode>. The full endpoint list is on the <Link href="/docs/api-reference" style={{ color: C.green }}>API reference</Link> page, and you can try requests in the <Link href="/docs/api-playground" style={{ color: C.green }}>API playground</Link>.</p>

      <hr style={divider} />

      <SectionAnchor id="api-rate-limits">Rate limits</SectionAnchor>
      <p style={body}>These endpoints have rate limits, counted per Cloudlink account:</p>
      <ul style={listStyle}>
        <li><InlineCode>POST /scan</InlineCode> — 5 requests per minute</li>
        <li><InlineCode>POST /regression/run</InlineCode> — 5 requests per minute</li>
        <li><InlineCode>POST /credentials</InlineCode> — 10 requests per minute</li>
      </ul>
      <p style={body}>Going over a limit returns HTTP 429.</p>

      <hr style={divider} />

      <SectionAnchor id="api-connections">Endpoints — Accounts and scans</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/health" desc="Service health check (no key needed)" />
        <EndpointRow method="GET" path="/setup/cloudformation-template" desc="Download the CloudFormation template (no key needed)" />
        <EndpointRow method="GET" path="/stats" desc="Resource count and last scan for your account" />
        <EndpointRow method="GET" path="/credentials" desc="List connected AWS accounts (secrets masked)" />
        <EndpointRow method="POST" path="/credentials" desc="Add an AWS account: { cloud: &quot;aws&quot;, label, role_arn, external_id, regions }" />
        <EndpointRow method="POST" path="/credentials/{id}/verify" desc="Assume the role and return the AWS account identity" />
        <EndpointRow method="DELETE" path="/credentials/{id}" desc="Remove a connected account" />
        <EndpointRow method="POST" path="/scan" desc="Start a scan of all connected accounts (optional body: { credential_ids: [...] })" />
        <EndpointRow method="GET" path="/scans" desc="Scan history" />
        <EndpointRow method="GET" path="/resources" desc="Scanned resources (?resource_type=, ?limit=, ?offset=)" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-regressions">Endpoints — Deploys and regressions</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="POST" path="/deploys" desc="Record a deploy event" />
        <EndpointRow method="GET" path="/deploys" desc="List deploy events (?service=, ?limit=)" />
        <EndpointRow method="GET" path="/deploys/{id}" desc="Get one deploy event" />
        <EndpointRow method="GET" path="/regressions" desc="List regressions (?status=open|acknowledged|resolved, ?limit=)" />
        <EndpointRow method="GET" path="/regressions/{id}" desc="Get one regression" />
        <EndpointRow method="POST" path="/regressions/{id}/acknowledge" desc="Mark an open regression as acknowledged" />
        <EndpointRow method="POST" path="/regressions/{id}/resolve" desc="Mark a regression as resolved" />
        <EndpointRow method="POST" path="/regression/run" desc="Run regression detection now" />
        <EndpointRow method="GET" path="/cost-snapshots" desc="Hourly cost snapshots by service (?service=, ?limit=)" />
        <EndpointRow method="GET" path="/cost-snapshots/services" desc="Service names that have cost snapshot data" />
      </EndpointTable>
      <p style={body}>Record a deploy from your CI pipeline after a successful deploy. Only <InlineCode>service</InlineCode> is required:</p>
      <CodeBlock language="bash">{`curl -X POST ${API_BASE}/deploys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "AWS Lambda",
    "version": "a3f8c1d",
    "environment": "production",
    "source": "github-actions"
  }'`}</CodeBlock>
      <p style={body}>The response is <InlineCode>{'{ "deploy_id": "...", "service": "...", "deployed_at": "..." }'}</InlineCode>. Field details are in the <Link href="/docs/ci-integration" style={{ color: C.green }}>CI integration guide</Link>.</p>

      <hr style={divider} />

      <SectionAnchor id="api-budgets">Endpoints — Budgets</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/budgets" desc="List budgets with this month's spend and utilization" />
        <EndpointRow method="POST" path="/budgets" desc="Create a budget" />
        <EndpointRow method="PUT" path="/budgets/{id}" desc="Update a budget" />
        <EndpointRow method="DELETE" path="/budgets/{id}" desc="Delete a budget" />
        <EndpointRow method="GET" path="/budgets/alerts" desc="Budget alert history (?budget_id=, ?limit=)" />
        <EndpointRow method="POST" path="/budgets/check" desc="Check budgets now and send alerts for thresholds reached" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-alerts">Endpoints — Alerts</SectionAnchor>
      <EndpointTable>
        <EndpointRow method="GET" path="/webhooks" desc="List webhooks (secrets masked)" />
        <EndpointRow method="POST" path="/webhooks" desc="Register a webhook: { url, secret?, events? }" />
        <EndpointRow method="DELETE" path="/webhooks/{id}" desc="Remove a webhook" />
        <EndpointRow method="POST" path="/webhooks/test" desc="Send a ping event to webhooks subscribed to ping" />
        <EndpointRow method="GET" path="/settings/slack" desc="Get the Slack webhook setting" />
        <EndpointRow method="PUT" path="/settings/slack" desc="Set the Slack webhook: { slack_webhook_url, enabled }" />
        <EndpointRow method="POST" path="/settings/slack/test" desc="Send a test message to Slack" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-v1">Endpoints — v1</SectionAnchor>
      <p style={body}>Read-only endpoints that wrap the same data with an <InlineCode>api_version</InlineCode> field:</p>
      <EndpointTable>
        <EndpointRow method="GET" path="/v1/costs" desc="Total cost, cost by service and daily trend from cost snapshots (?days=30)" />
        <EndpointRow method="GET" path="/v1/regressions" desc="Regressions (?status=)" />
        <EndpointRow method="GET" path="/v1/resources" desc="Scanned resources (?resource_type=)" />
        <EndpointRow method="GET" path="/v1/deploys" desc="Deploy events (?service=, ?limit=)" />
        <EndpointRow method="GET" path="/v1/budgets" desc="Budgets with their most recent alerts" />
      </EndpointTable>

      <hr style={divider} />

      <SectionAnchor id="api-errors">Errors</SectionAnchor>
      <p style={body}>Errors return JSON with a <InlineCode>detail</InlineCode> field:</p>
      <CodeBlock language="json">{`{ "detail": "Invalid or missing authentication. Use a Clerk session or API key." }`}</CodeBlock>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
        {[
          { code: '400', label: 'Bad Request', desc: 'A field is missing or invalid (some endpoints use 422 for this).' },
          { code: '401', label: 'Unauthorized', desc: 'Missing or invalid API key.' },
          { code: '403', label: 'Forbidden', desc: 'The request would change something in your cloud account, which read-only mode does not allow.' },
          { code: '404', label: 'Not Found', desc: 'The resource does not exist in your account.' },
          { code: '422', label: 'Unprocessable', desc: 'A field is missing or invalid.' },
          { code: '429', label: 'Rate Limited', desc: 'Too many requests. See Rate limits.' },
          { code: '500', label: 'Internal Server Error', desc: 'Something went wrong on our side. Email us if it keeps happening.' },
        ].map((row, i, arr) => (
          <div key={row.code} style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 700, color: parseInt(row.code) >= 500 ? '#EF4444' : '#F59E0B', minWidth: '36px' }}>{row.code}</span>
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

      <SectionAnchor id="mcp-overview">MCP server</SectionAnchor>
      <p style={warn}><strong>Status: in development.</strong> The MCP server is not published as a package and does not yet work with the hosted API, so it is not available to pilot customers.</p>
      <p style={body}>Cloudlink has an early Model Context Protocol (MCP) server that lets AI assistants such as Claude Desktop or Cursor read your Cloudlink data. It is a Python script (<InlineCode>mcp_server.py</InlineCode>) that talks to the Cloudlink API over stdio and only reads data.</p>

      <hr style={divider} />

      <SectionAnchor id="mcp-tools">MCP tools</SectionAnchor>
      <p style={body}>The read-only tools it defines:</p>
      <KeyValueTable keyWidth="200px" rows={[
        { k: 'get_cost_summary', v: 'Recent spend by service, from cost snapshots.' },
        { k: 'get_cost_breakdown', v: 'Cost grouped by service, from cost snapshots.' },
        { k: 'get_cost_anomalies', v: 'Services whose recent cost is unusually high compared with earlier snapshots.' },
        { k: 'get_cost_regressions', v: 'Recent cost regressions.' },
        { k: 'get_budgets', v: 'Budgets and how much of each has been used.' },
      ]} />

      {/* ═══════════════════════════════════════════════════════════════════════
          INTEGRATIONS
      ═══════════════════════════════════════════════════════════════════════ */}

      <hr style={divider} />

      <SectionAnchor id="slack-alerts">Slack alerts</SectionAnchor>
      <p style={body}>Cloudlink posts to Slack through a Slack incoming webhook.</p>
      <SubAnchor id="slack-setup">Setup</SubAnchor>
      <ol style={listStyle}>
        <li>In Slack, create an incoming webhook for the channel you want alerts in. The URL starts with <InlineCode>https://hooks.slack.com/</InlineCode>.</li>
        <li>In the Cloudlink dashboard, open <strong>Webhooks</strong> and paste the URL into <strong>Slack Alerts</strong>. (API: <InlineCode>PUT /settings/slack</InlineCode>.)</li>
        <li>Send a test message to check it works. (API: <InlineCode>POST /settings/slack/test</InlineCode>.)</li>
      </ol>
      <SubAnchor id="slack-alert-types">What gets sent</SubAnchor>
      <ul style={listStyle}>
        <li>A message for each new cost regression (see <a href="#regression-alerts" style={{ color: C.green }}>Regression alerts</a>)</li>
        <li>A message each time a budget threshold is reached, with the budget name, threshold, scope, current spend, limit and utilization</li>
      </ul>

      <hr style={divider} />

      <SectionAnchor id="deploy-events">Deploy events from CI</SectionAnchor>
      <p style={body}>To tie cost changes to deploys, add a step after your deploy step that calls <InlineCode>POST /deploys</InlineCode>. For GitHub Actions:</p>
      <CodeBlock language="yaml">{`# .github/workflows/deploy.yml
- name: Notify Cloudlink of deploy
  if: success()
  run: |
    curl -s -X POST \${{ secrets.CLOUDLINK_API_URL }}/deploys \\
      -H "Authorization: Bearer \${{ secrets.CLOUDLINK_API_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "service": "AWS Lambda",
        "version": "\${{ github.sha }}",
        "environment": "production",
        "source": "github-actions"
      }'`}</CodeBlock>
      <p style={body}>Set <InlineCode>CLOUDLINK_API_URL</InlineCode> to <InlineCode>{API_BASE}</InlineCode>. The <Link href="/docs/ci-integration" style={{ color: C.green }}>CI integration guide</Link> has GitLab CI and plain curl examples, and the field list.</p>

      <hr style={divider} />

      <SectionAnchor id="email-notifications">Email</SectionAnchor>
      <p style={body}>Cloudlink sends a weekly summary email on Mondays at 08:00 UTC to your account&apos;s notification email. It covers the week&apos;s spend compared with the week before, the top services by cost, the number of cost regressions that week, and a short list of suggestions. Regression and budget alerts are sent to Slack and webhooks, not email.</p>

      <hr style={divider} />

      <SectionAnchor id="webhooks">Webhooks</SectionAnchor>
      <p style={body}>Cloudlink can send events as HTTP POST requests to your own endpoint, so you can forward them to your own tools. Register a webhook on the <strong>Webhooks</strong> page or with the API:</p>
      <CodeBlock language="bash">{`curl -X POST ${API_BASE}/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/cloudlink-hook",
    "secret": "a-long-random-string",
    "events": ["regression.detected", "budget.threshold_reached", "deploy.created", "scan.finished"]
  }'`}</CodeBlock>
      <p style={body}>The URL must be a public <InlineCode>http</InlineCode> or <InlineCode>https</InlineCode> address. A webhook only receives the events in its <InlineCode>events</InlineCode> list. If you leave <InlineCode>events</InlineCode> out, the only event in the default list that Cloudlink currently sends is <InlineCode>scan.finished</InlineCode>, so list the events you want.</p>
      <SubAnchor id="webhook-events">Events</SubAnchor>
      <ul style={listStyle}>
        <li><InlineCode>regression.detected</InlineCode> — a new cost regression was created</li>
        <li><InlineCode>budget.threshold_reached</InlineCode> — a budget crossed one of its thresholds</li>
        <li><InlineCode>deploy.created</InlineCode> — a deploy event was recorded</li>
        <li><InlineCode>scan.finished</InlineCode> — a scan of one connected account finished</li>
        <li><InlineCode>ping</InlineCode> — sent by <InlineCode>POST /webhooks/test</InlineCode> to webhooks subscribed to it</li>
      </ul>
      <SubAnchor id="webhook-payload">Payload</SubAnchor>
      <p style={body}>The body has the event name and an event-specific <InlineCode>payload</InlineCode>. Example for <InlineCode>regression.detected</InlineCode> (values are illustrative):</p>
      <CodeBlock language="json">{`{
  "event": "regression.detected",
  "payload": {
    "regression_id": "…",
    "tenant_id": "…",
    "deploy_id": "…",
    "service": "AWS Lambda",
    "version": "a3f8c1d",
    "environment": "production",
    "deployed_at": "2026-10-01T14:32:00+00:00",
    "baseline_hourly_usd": 0.5,
    "post_hourly_usd": 0.6,
    "change_pct": 20.0,
    "monthly_impact_usd": 72.0,
    "confidence": "high"
  }
}`}</CodeBlock>
      <SubAnchor id="webhook-security">Verifying the signature</SubAnchor>
      <p style={body}>If you set a <InlineCode>secret</InlineCode>, each request has an <InlineCode>X-Cloudlink-Signature</InlineCode> header with the value <InlineCode>sha256=</InlineCode> followed by the hex HMAC-SHA256 of the raw request body, keyed with your secret:</p>
      <CodeBlock language="python">{`import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """Verify the X-Cloudlink-Signature header."""
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)`}</CodeBlock>

      {/* Footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px', paddingTop: '24px', marginTop: '40px', borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.textMuted }}>
          Cloudlink Docs · <Link href="/pilot" style={{ color: C.green, textDecoration: 'none' }}>Join the free pilot →</Link>
        </span>
        <a href={`mailto:${CONTACT}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.green, textDecoration: 'none' }}>
          {CONTACT}
        </a>
      </div>

    </article>
  )
}
