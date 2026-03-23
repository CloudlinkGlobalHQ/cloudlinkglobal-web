export default function SetupPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Setup Guide</h1>
      <p className="lead">Get Cloudlink running in under 5 minutes. Connect your AWS account, run your first scan, and start tracking cost regressions.</p>

      <h2>1. Create your account</h2>
      <p>Sign up at <a href="https://cloudlinkglobal.com/signup">cloudlinkglobal.com/signup</a> with your email or Google account.</p>

      <h2>2. Add an AWS credential</h2>
      <p>Navigate to <strong>Dashboard &rarr; Credentials</strong> and click <strong>Add credential</strong>.</p>
      <p>Cloudlink supports two authentication methods:</p>
      <ul>
        <li><strong>IAM Role (recommended)</strong> &mdash; Create a read-only IAM role in your AWS account with <code>ce:GetCostAndUsage</code> and <code>ce:GetCostForecast</code> permissions. Paste the Role ARN into Cloudlink.</li>
        <li><strong>Access Keys</strong> &mdash; Create an IAM user with read-only Cost Explorer access. Paste the Access Key ID and Secret.</li>
      </ul>

      <h3>Minimum IAM Policy</h3>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "s3:ListAllMyBuckets",
        "s3:GetBucketVersioning",
        "s3:GetBucketLocation"
      ],
      "Resource": "*"
    }
  ]
}`}</pre>

      <h2>3. Run your first scan</h2>
      <p>Click <strong>Run scan</strong> in the top nav. Cloudlink will discover your AWS resources and start collecting hourly cost snapshots.</p>

      <h2>4. Connect your CI pipeline</h2>
      <p>To detect cost regressions linked to deploys, add a webhook to your CI pipeline. See the <a href="/docs/ci-integration">CI Integration guide</a> for details.</p>

      <h2>5. Wait for baseline</h2>
      <p>Cloudlink needs 7 days of hourly cost data to build a reliable baseline. During this time, cost snapshots are collected automatically every 30 minutes. Once the baseline is ready, regressions will be detected automatically after each deploy.</p>

      <h2>Need help?</h2>
      <p>Contact us at <a href="mailto:satvikranga60@gmail.com">satvikranga60@gmail.com</a> or join our Slack community.</p>
    </article>
  )
}
