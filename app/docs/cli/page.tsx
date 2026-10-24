export const metadata = { title: 'CLI' }

const API_BASE = 'https://cloudlink-agents.onrender.com'
const CONTACT = 'satvikranga60@gmail.com'

export default function CLIDocsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cloudlink CLI</h1>
      <p className="lead">
        A small command-line wrapper around the Cloudlink REST API for health checks, scans, cost data, regressions, budget checks and deploy events.
      </p>

      <h2>Getting the CLI</h2>
      <p>
        The CLI is a single Python file, <code>cloudlink_cli.py</code>, in Cloudlink&apos;s backend source code. It is not
        published to PyPI or npm. If you want to use it, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
      <p>It needs Python 3 and the <code>httpx</code> package (<code>pip install httpx</code>).</p>

      <h2>Configuration</h2>
      <table>
        <thead><tr><th>Variable</th><th>Flag</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>CLOUDLINK_API_URL</code></td><td><code>--api-url</code></td><td>API base URL. Set it to <code>{API_BASE}</code> (the default is <code>http://localhost:8000</code>).</td></tr>
          <tr><td><code>CLOUDLINK_API_KEY</code></td><td><code>--api-key</code></td><td>Your API key. Required for every command except <code>health</code>.</td></tr>
        </tbody>
      </table>
      <p>Flags go before the command, for example <code>python cloudlink_cli.py --api-key ... stats</code>.</p>

      <h2>Quick start</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`export CLOUDLINK_API_URL=${API_BASE}
export CLOUDLINK_API_KEY=YOUR_API_KEY

python cloudlink_cli.py health
python cloudlink_cli.py stats
python cloudlink_cli.py costs --days 30`}</pre>

      <h2>Commands</h2>
      <table>
        <thead><tr><th>Command</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><code>health</code></td><td>Calls <code>GET /health</code></td></tr>
          <tr><td><code>stats</code></td><td>Calls <code>GET /stats</code></td></tr>
          <tr><td><code>costs [--days N]</code></td><td>Calls <code>GET /v1/costs</code> (default 30 days)</td></tr>
          <tr><td><code>anomalies</code></td><td>Calls <code>GET /v1/anomalies</code></td></tr>
          <tr><td><code>scan</code></td><td>Starts a scan with <code>POST /scan</code></td></tr>
          <tr><td><code>budget-check</code></td><td>Runs budget threshold checks now with <code>POST /budgets/check</code></td></tr>
          <tr><td><code>regressions list [--status open|acknowledged|resolved]</code></td><td>Calls <code>GET /regressions</code></td></tr>
          <tr><td><code>deploys list [--service NAME]</code></td><td>Calls <code>GET /deploys</code></td></tr>
          <tr><td><code>deploys create --service NAME --version VERSION [--environment ENV] [--source SOURCE] [--metadata JSON]</code></td><td>Records a deploy with <code>POST /deploys</code>. <code>--environment</code> defaults to <code>production</code> and <code>--source</code> to <code>cli</code>.</td></tr>
        </tbody>
      </table>
      <p>Output is printed as JSON. If the API returns an error, the CLI prints the status code and message and exits.</p>

      <h2>Examples</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{`# List open regressions
python cloudlink_cli.py regressions list --status open

# Record a deploy from CI or your laptop.
# --service must match a Cost Explorer service name, e.g. "AWS Lambda".
python cloudlink_cli.py deploys create \\
  --service "AWS Lambda" \\
  --version "$(git rev-parse --short HEAD)" \\
  --environment production \\
  --source github-actions

# Start a scan
python cloudlink_cli.py scan

# Check budget thresholds now
python cloudlink_cli.py budget-check`}</pre>
    </article>
  )
}
