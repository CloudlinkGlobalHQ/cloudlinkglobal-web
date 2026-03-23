export default function CIIntegrationPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>CI Integration</h1>
      <p className="lead">Send deploy events from your CI/CD pipeline so Cloudlink can link cost changes to specific releases.</p>

      <h2>How it works</h2>
      <ol>
        <li>Your CI pipeline deploys code</li>
        <li>After the deploy step, it sends a POST request to Cloudlink&apos;s <code>/deploys</code> endpoint</li>
        <li>Cloudlink records the deploy and, after 2-3 hours, compares post-deploy costs against the 7-day baseline</li>
        <li>If costs spike &gt;10%, a regression is created and alerts fire (Slack, email, webhooks)</li>
      </ol>

      <h2>GitHub Actions</h2>
      <p>Add this step after your deploy step in your workflow:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`- name: Notify Cloudlink
  if: success()
  run: |
    curl -s -X POST \${{ secrets.CLOUDLINK_API_URL }}/deploys \\
      -H "Authorization: Bearer \${{ secrets.CLOUDLINK_API_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "service": "my-service",
        "version": "\${{ github.sha }}",
        "environment": "production",
        "source": "github-actions"
      }'`}</pre>

      <h3>Required secrets</h3>
      <table>
        <thead><tr><th>Secret</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td><code>CLOUDLINK_API_URL</code></td><td>Your Cloudlink API URL (e.g. <code>https://cloudlink-agents-production.up.railway.app</code>)</td></tr>
          <tr><td><code>CLOUDLINK_API_KEY</code></td><td>Your API key from the Cloudlink dashboard</td></tr>
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
          \\"service\\": \\"my-service\\",
          \\"version\\": \\"$CI_COMMIT_SHA\\",
          \\"environment\\": \\"production\\",
          \\"source\\": \\"gitlab-ci\\"
        }"
  only:
    - main`}</pre>

      <h2>Generic (any CI)</h2>
      <p>Any system that can make HTTP requests can send deploy events:</p>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`curl -X POST https://your-api-url/deploys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "service-name",
    "version": "v1.2.3",
    "environment": "production"
  }'`}</pre>

      <h2>Deploy event fields</h2>
      <table>
        <thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>service</code></td><td>Yes</td><td>AWS service name (must match Cost Explorer service name, e.g. &quot;Amazon EC2&quot;)</td></tr>
          <tr><td><code>version</code></td><td>No</td><td>Git SHA, tag, or version number</td></tr>
          <tr><td><code>environment</code></td><td>No</td><td>Deploy target (default: &quot;production&quot;)</td></tr>
          <tr><td><code>source</code></td><td>No</td><td>CI system identifier</td></tr>
          <tr><td><code>metadata</code></td><td>No</td><td>Arbitrary JSON object for your own tracking</td></tr>
        </tbody>
      </table>

      <h2>Verifying integration</h2>
      <p>After pushing a deploy event, check <strong>Dashboard &rarr; Deploys</strong> to confirm it appeared. You can also click <strong>Run detection</strong> to manually trigger regression analysis (normally runs automatically every 30 minutes).</p>
    </article>
  )
}
