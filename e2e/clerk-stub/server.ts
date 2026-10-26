// Test-only stand-in for @clerk/nextjs/server. See e2e/clerk-stub/index.tsx.
import { NextResponse } from 'next/server'

export function clerkMiddleware() { return () => NextResponse.next() }
export function createRouteMatcher() { return () => false }
export async function auth() { return { userId: 'user_e2e', getToken: async () => 'e2e-test-token' } }
