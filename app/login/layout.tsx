import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Cloudlink to see your AWS findings and savings.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
