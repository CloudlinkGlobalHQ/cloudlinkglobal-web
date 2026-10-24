import Link from 'next/link'

export const metadata = { title: 'Setup' }

const API_BASE = 'https://cloudlink-agents.onrender.com'
const CONTACT = 'satvikranga60@gmail.com'

export default function SetupPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Setup Guide</h1>
      <p className="lead">Connect an AWS account to Cloudlink with one read-only IAM role, run your first scan, and get ready to track cost regressions.</p>

      <h2>1. Create your account</h2>
      <p>Sign up at <Link href="/signup">cloudlinkglobal.com/signup</Link>, or apply for the free fall 2026 pilot at <Link href="/pilot">cloudlinkglobal.com/pilot</Link>.</p>

      <h2>2. Deploy the CloudFormation template</h2>
      <p>In the dashboard, open <strong>Credentials</strong>, click <strong>+ Add credential</strong>, and download <code>cloudlink-role.yaml</code>. You can also download it from <code>{`${API_BASE}/setup/cloudformation-template`}</code>.</p>
      <p>Create a stack from it in the AWS CloudFormation console:</p>
      <ul>
        <li><strong>ExternalId</strong> &mdash; a secret string you choose (8 to 128 characters). You will enter it in Cloudlink in step 3.</li>
        <li><strong>RoleName</strong> &mdash; defaults to <code>CloudlinkRole</code>.</li>
        <li><strong>CloudlinkAccountId</strong> &mdash; only shown if the template does not already include Cloudlink&apos;s AWS account ID. Use the 12-digit ID we give you during onboarding.</li>
      </ul>
      <p>The stack creates one IAM role that only Cloudlink&apos;s AWS account can assume, and only with your External ID. Its policy allows exactly these 22 read-only actions:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeVolumes",
        "ec2:DescribeRegions",
        "ec2:DescribeTags",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "s3:GetBucketPublicAccessBlock",
        "s3:GetBucketEncryption",
        "s3:GetBucketVersioning",
        "s3:GetBucketAcl",
        "rds:DescribeDBInstances",
        "rds:DescribeDBClusters",
        "lambda:ListFunctions",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}`}</pre>
      <p>There are no write permissions and no <code>s3:GetObject</code>. Cloudlink runs in read-only mode and never changes anything in your account. To cut off access, delete the stack.</p>

      <h2>3. Add the credential in Cloudlink</h2>
      <p>Copy <code>RoleArn</code> from the stack&apos;s <strong>Outputs</strong> tab. On the <strong>Credentials</strong> page, paste the role ARN and your External ID, and list the regions to scan (comma-separated; if left empty, only <code>us-east-1</code> is scanned). Click <strong>Save credential</strong>, then <strong>Verify</strong> to check that Cloudlink can assume the role.</p>

      <h2>4. Turn on hourly cost data</h2>
      <p>Cost-regression detection and budgets use hourly cost by service from Cost Explorer. AWS only returns hourly data if hourly granularity is turned on in your Cost Explorer preferences, and AWS charges for it. Without it, Cloudlink still reads month-to-date costs and scans your resources.</p>
      <p>AWS also bills Cost Explorer API requests to the scanned account (currently $0.01 per request). Each Cloudlink scan makes three of them.</p>

      <h2>5. Run your first scan</h2>
      <p>Click <strong>Scan</strong> next to the credential. After that, scans run automatically every 30 minutes by default. Findings appear on the <strong>Resources</strong> page.</p>

      <h2>6. Connect your CI pipeline (optional)</h2>
      <p>To find cost regressions tied to deploys, send a deploy event from your CI pipeline after each deploy. See the <Link href="/docs/ci-integration">CI integration guide</Link>.</p>

      <h2>7. Wait for data</h2>
      <p>Each scan fetches the last 48 hours of hourly cost by service. Regression detection needs hourly cost data from both before and after a deploy, and only looks at a deploy once it is at least 2 hours old. Until there is enough data, deploys are left for the next detection run (every 30 minutes by default).</p>

      <h2>Need help?</h2>
      <p>Email us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </article>
  )
}
