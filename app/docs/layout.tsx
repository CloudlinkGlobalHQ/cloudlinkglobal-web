import Link from 'next/link'

const DOCS_NAV = [
  { label: 'Setup Guide', href: '/docs/setup' },
  { label: 'CI Integration', href: '/docs/ci-integration' },
  { label: 'API Reference', href: '/docs/api-reference' },
  { label: 'API Playground', href: '/docs/api-playground' },
  { label: 'CLI', href: '/docs/cli' },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="cl-doc" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#cl-doc)" />
              <circle cx="12" cy="21" r="3.5" fill="white" />
              <circle cx="28" cy="21" r="3.5" fill="white" />
              <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-gray-900">Cloudlink Docs</span>
          </Link>
          <nav className="flex gap-4">
            {DOCS_NAV.map(({ label, href }) => (
              <Link key={href} href={href} className="text-sm text-gray-500 hover:text-green-600 transition">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  )
}
