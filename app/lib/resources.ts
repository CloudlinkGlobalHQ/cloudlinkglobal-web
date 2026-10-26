// Helpers for resources returned by GET /resources (written by the AWS scanner
// in cloudlink-agents/scanner/aws_scanner.py).

export type ScannedResource = {
  resource_id: string
  resource_type?: string
  provider?: string
  region?: string
  payload?: Record<string, unknown> & {
    name?: string
    is_idle?: boolean
    avg_cpu_7d?: number | null
    instance_type?: string
    size_gb?: number
    issues?: string[]
    open_ports?: { port?: number | string; label?: string; cidr?: string }[]
  }
}

export const TYPE_LABELS: Record<string, string> = {
  ec2_instance: 'EC2 instance',
  ebs_volume: 'EBS volume',
  rds_instance: 'RDS database',
  lambda_function: 'Lambda function',
  s3_bucket: 'S3 bucket',
  security_group: 'Security group',
  aws_cost: 'Monthly cost',
}

const ISSUE_TEXT: Record<string, string> = {
  unattached: 'Unattached volume',
  versioning_disabled: 'Versioning disabled',
  versioning_check_failed: 'Couldn’t check versioning',
  publicly_accessible: 'Publicly accessible',
  public_access_not_fully_blocked: 'Public access not fully blocked',
  no_public_access_block: 'No public access block',
  no_encryption: 'Not encrypted',
  storage_not_encrypted: 'Storage not encrypted',
  instance_stopped: 'Stopped (storage still billed)',
  no_automated_backups: 'No automated backups',
  no_multi_az: 'Not Multi-AZ',
}

export function issueText(issue: string): string {
  const key = issue.split(':')[0]
  return ISSUE_TEXT[key] || key.replace(/_/g, ' ')
}

/** Human-readable findings for one resource; empty when nothing was flagged. */
export function findingsOf(r: ScannedResource): string[] {
  if (r.resource_type === 'aws_cost') return []
  const p = r.payload || {}
  const out: string[] = []
  if (p.is_idle) {
    out.push(p.avg_cpu_7d != null ? `Idle — avg CPU ${p.avg_cpu_7d}% over 7 days` : 'Idle')
  }
  for (const issue of p.issues || []) out.push(issueText(issue))
  const ports = (p.open_ports || []).map((o) => o.label || String(o.port)).filter(Boolean)
  if (ports.length) out.push(`Open to the internet: ${Array.from(new Set(ports)).join(', ')}`)
  return out
}

export function displayName(r: ScannedResource): string {
  const name = r.payload?.name
  return typeof name === 'string' && name && name !== r.resource_id ? name : r.resource_id
}
