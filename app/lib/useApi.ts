'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DependencyList } from 'react'
import { ApiError, toApiError } from './api'

/** Fired after something (e.g. a scan) changes backend data; every useApi refetches. */
export const DATA_CHANGED_EVENT = 'cloudlink:data-changed'

export function notifyDataChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DATA_CHANGED_EVENT))
}

export type ApiState<T> = {
  data: T | undefined
  error: ApiError | null
  loading: boolean
  retry: () => void
}

type Settled<T> = { key: string; data: T | undefined; error: ApiError | null }

/**
 * Run `fetcher` on mount and whenever `deps` change.
 * `loading` is true until the current request settles; `request()` times out,
 * so loading can never outlast the timeout. `data` keeps the last success.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList = []): ApiState<T> {
  const fetcherRef = useRef(fetcher)
  useLayoutEffect(() => { fetcherRef.current = fetcher })

  const [nonce, setNonce] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>({ key: '', data: undefined, error: null })
  const key = `${JSON.stringify(deps)}#${nonce}`

  useEffect(() => {
    let cancelled = false
    fetcherRef.current().then(
      (data) => { if (!cancelled) setSettled({ key, data, error: null }) },
      (err) => { if (!cancelled) setSettled((prev) => ({ key, data: prev.data, error: toApiError(err) })) },
    )
    return () => { cancelled = true }
  }, [key])

  const retry = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    window.addEventListener(DATA_CHANGED_EVENT, retry)
    return () => window.removeEventListener(DATA_CHANGED_EVENT, retry)
  }, [retry])

  const loading = settled.key !== key
  return { data: settled.data, error: loading ? null : settled.error, loading, retry }
}
