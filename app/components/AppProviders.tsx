'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const DynamicClerkProvider = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
)

export default function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const needsClerk =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/dashboard')

  if (!needsClerk) {
    return <>{children}</>
  }

  return <DynamicClerkProvider>{children}</DynamicClerkProvider>
}
