'use client'

import { useLayoutEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setTokenGetter } from '../lib/api'

export default function ClerkApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth()

  // A layout effect runs before the children's useEffect fetches, and
  // request() waits for the getter, so the first calls after a hard load
  // carry the Clerk token instead of an empty Authorization header.
  useLayoutEffect(() => {
    if (isLoaded) setTokenGetter(getToken)
  }, [getToken, isLoaded])

  return <>{children}</>
}
