import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a Cloudlink account and connect AWS with a read-only role in about 5 minutes.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
