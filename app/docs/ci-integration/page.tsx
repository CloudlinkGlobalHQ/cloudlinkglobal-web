import Link from 'next/link'

export const metadata = { title: 'CI integration' }

const API_BASE = 'https://cloudlink-agents.onrender.com'

export default function CIIntegrationPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>CI Integration</h1>
      <p className="lead">Send deploy events from your CI/CD pipeline so Cloudlink can compare a service&apos;s cost before and after each release.</p>

      <h2>How it works</h2>
      <ol>
        <li>Your CI pipeline deploys code.</li>
        <li>After the deploy step, it sends a <code>POST /deploys</code> request to Cloudlink.</li>
        <li>Once the deploy is at least 2 hours old, Cloudlink compares the service&apos;s average hourly cost before the deploy with its average hourly cost in the hours right after it. Detection runs every 30 minutes by default.</li>
        <li>If the cost is up by 10% or more, Cloudlink creates a regression and sends a Slack alert and a <code>regression.detected</code> webhook, if you have set those up.</li>
      </ol>
      <p>This needs hourly cost data from Cost Explorer. See <Link href="/docs#cost-data">Cost data</Link>.</p>

      <h2>Use Cost Explorer service names</h2>
      <p>
        The <code>service</code> field must match a Cost Explorer service name exactly (for example <code>AWS Lambda</code>), because
        Cloudlink compares it against hourly cost by service. A name that doesn&apos;t match has no cost data, so no regression can be
        found for it. To see the names Cloudlink has data for, call:
      </p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`curl ${API_BASE}/cost-snapshots/services \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>

      <h2>GitHub Actions</h2>
      <p>Add this step after your deploy step:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`- name: Notify Cloudlink
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
      }'`}</pre>

      <h3>Required secrets</h3>
      <table>
        <thead><tr><th>Secret</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td><code>CLOUDLINK_API_URL</code></td><td><code>{API_BASE}</code></td></tr>
          <tr><td><code>CLOUDLINK_API_KEY</code></td><td>Your Cloudlink API key</td></tr>
        </tbody>
      </table>

      <h2>GitLab CI</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`notify_cloudlink:
  stage: post-deploy
  script:
    - |
      curl -s -X POST $CLOUDLINK_API_URL/deploys \\
        -H "Authorization: Bearer $CLOUDLINK_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d "{
          \\"service\\": \\"AWS Lambda\\",
          \\"version\\": \\"$CI_COMMIT_SHA\\",
          \\"environment\\": \\"production\\",
          \\"source\\": \\"gitlab-ci\\"
        }"
  only:
    - main`}</pre>

      <h2>Any other CI system</h2>
      <p>Anything that can make an HTTP request can send deploy events:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`curl -X POST ${API_BASE}/deploys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "AWS Lambda",
    "version": "v1.2.3",
    "environment": "production"
  }'`}</pre>
      <p>The response is <code>{'{ "deploy_id": "...", "service": "...", "deployed_at": "..." }'}</code>.</p>

      <h2>Deploy event fields</h2>
      <table>
        <thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>service</code></td><td>Yes</td><td>Cost Explorer service name, e.g. &quot;AWS Lambda&quot;</td></tr>
          <tr><td><code>deployed_at</code></td><td>No</td><td>ISO 8601 timestamp of the deploy (default: the time Cloudlink receives the request)</td></tr>
          <tr><td><code>version</code></td><td>No</td><td>Git SHA, tag, or version number</td></tr>
          <tr><td><code>environment</code></td><td>No</td><td>Deploy target (default: &quot;production&quot;)</td></tr>
          <tr><td><code>source</code></td><td>No</td><td>CI system label (default: &quot;api&quot;)</td></tr>
          <tr><td><code>metadata</code></td><td>No</td><td>Any JSON object for your own tracking</td></tr>
        </tbody>
      </table>

      <h2>Checking it works</h2>
      <p>After sending a deploy event, open <strong>Dashboard &rarr; Deploys</strong> to confirm it appeared. You can click <strong>Run detection</strong> there to run regression detection right away instead of waiting for the next scheduled run. A deploy is only analysed once it is at least 2 hours old and there is hourly cost data from after it.</p>
    </article>
  )
}
