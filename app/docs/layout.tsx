import type { Metadata } from 'next'
import DocsShell from './DocsShell'

export const metadata: Metadata = {
  title: { default: 'Docs', template: 'Cloudlink Docs | %s' },
  description:
    'How to connect AWS to Cloudlink with a read-only role, what each scan checks, and how to use the API.',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
