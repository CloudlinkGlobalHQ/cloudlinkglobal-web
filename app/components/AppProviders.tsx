'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const DynamicClerkProvider = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
)

// Clerk's sign-in/sign-up flows continue on sub-paths (e.g. /signup/verify-email-address),
// so match the whole subtree, not just the entry page.
const CLERK_ROUTES = ['/login', '/signup', '/dashboard']

export function needsClerk(pathname: string | null): boolean {
  if (!pathname) return false
  return CLERK_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export default function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (!needsClerk(pathname)) {
    return <>{children}</>
  }

  return <DynamicClerkProvider>{children}</DynamicClerkProvider>
}
