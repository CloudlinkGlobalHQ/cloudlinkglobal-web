import Link from 'next/link'

const pages = [
  { title: 'Setup Guide', href: '/docs/setup', desc: 'Connect your AWS account and run your first scan in under 5 minutes.' },
  { title: 'CI Integration', href: '/docs/ci-integration', desc: 'Send deploy events from GitHub Actions, GitLab CI, or any CI/CD pipeline.' },
  { title: 'API Reference', href: '/docs/api-reference', desc: 'Full REST API documentation for programmatic access.' },
]

export default function DocsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
      <p className="text-gray-500 mb-8">Everything you need to get started with Cloudlink.</p>
      <div className="grid gap-4">
        {pages.map((p) => (
          <Link key={p.href} href={p.href} className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-green-300 hover:shadow-sm transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
