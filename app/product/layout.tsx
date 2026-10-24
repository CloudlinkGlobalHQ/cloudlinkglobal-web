import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How Cloudlink finds idle and unused AWS resources and cost spikes with a read-only role, and what it covers today.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
