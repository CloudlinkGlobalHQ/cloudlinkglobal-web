'use client'
// Test-only stand-in for @clerk/nextjs, aliased in next.config.ts when
// CLOUDLINK_E2E_CLERK_STUB=1. Never part of a deployed build.
import type { ReactNode } from 'react'

const getToken = async () => 'e2e-test-token'

export function ClerkProvider({ children }: { children: ReactNode }) { return <>{children}</> }
export function useAuth() { return { isLoaded: true, isSignedIn: true, userId: 'user_e2e', getToken } }
export function useUser() {
  return { isLoaded: true, isSignedIn: true, user: { id: 'user_e2e', primaryEmailAddress: { emailAddress: 'e2e@example.com' } } }
}
export function UserButton() { return <button type="button" aria-label="User menu" className="h-7 w-7 rounded-full bg-slate-600" /> }
export function SignIn() { return <div>Sign in</div> }
export function SignUp() { return <div>Sign up</div> }
