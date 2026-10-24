import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Cloudlink charges 15% of verified savings, and nothing if there are none. The fall 2026 pilot is free.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
