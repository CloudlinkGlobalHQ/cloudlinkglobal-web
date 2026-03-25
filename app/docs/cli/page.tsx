export default function CLIDocsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cloudlink CLI</h1>
      <p className="lead">
        Use Cloudlink from your terminal for deploy notifications, scans, regressions, and cost summaries.
      </p>

      <h2>Location</h2>
      <p>
        The CLI ships in the <code>cloudlink-agents</code> repo as <code>cloudlink_cli.py</code>.
      </p>

      <h2>Environment variables</h2>
      <table>
        <thead><tr><th>Variable</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>CLOUDLINK_API_URL</code></td><td>Your Cloudlink API base URL</td></tr>
          <tr><td><code>CLOUDLINK_API_KEY</code></td><td>Your API key for authenticated requests</td></tr>
        </tbody>
      </table>

      <h2>Quick start</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`export CLOUDLINK_API_URL=https://cloudlink-agents-production.up.railway.app
export CLOUDLINK_API_KEY=cl_live_your_key

python cloudlink_cli.py health
python cloudlink_cli.py stats
python cloudlink_cli.py costs --days 30`}</pre>

      <h2>Common commands</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`# List open regressions
python cloudlink_cli.py regressions list --status open

# Record a deploy from CI or your laptop
python cloudlink_cli.py deploys create \\
  --service "Amazon EC2" \\
  --version "$(git rev-parse --short HEAD)" \\
  --environment production \\
  --source github-actions

# Trigger a scan or action loop
python cloudlink_cli.py scan
python cloudlink_cli.py run-once

# Check budget thresholds immediately
python cloudlink_cli.py budget-check`}</pre>

      <h2>CI usage</h2>
      <p>
        The CLI is a good fit for GitHub Actions, GitLab CI, Jenkins, and internal deploy tooling when you want a
        simple wrapper around the REST API without writing curl by hand.
      </p>
    </article>
  )
}
