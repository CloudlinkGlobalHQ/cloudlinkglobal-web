'use client'

import { useSyncExternalStore } from 'react'
import { scanNow, toApiError } from './api'
import { describeError } from './errors'
import { notifyDataChanged } from './useApi'

export type ScanStatus = 'idle' | 'running' | 'success' | 'queued' | 'needs_credentials' | 'error'
export type ScanState = { status: ScanStatus; message: string }

// One scan at a time, shared by the header button, the Scans page, the
// Overview and the Credentials page so they all show the same progress.
let state: ScanState = { status: 'idle', message: '' }
const listeners = new Set<() => void>()
let resetTimer: ReturnType<typeof setTimeout> | null = null

function set(next: ScanState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

type ScanResult = {
  queued?: boolean
  message?: string
  credentials_scanned?: number
  total_events_found?: number
  scans?: { status?: string; error?: string }[]
}

export function summarizeScan(res: ScanResult): ScanState {
  if (res?.queued) {
    return { status: 'queued', message: 'Scan queued. Results appear on the Scans page in a few minutes.' }
  }
  const scans = Array.isArray(res?.scans) ? res.scans : []
  if (!res?.credentials_scanned && scans.length === 0) {
    return { status: 'needs_credentials', message: 'Connect an AWS account before running a scan.' }
  }
  const failed = scans.filter((s) => s.status === 'error')
  if (failed.length && failed.length === scans.length) {
    return { status: 'error', message: `Scan failed: ${failed[0].error || 'unknown error'}` }
  }
  const found = res.total_events_found ?? 0
  const base = `Scan finished: ${found} item${found === 1 ? '' : 's'} found.`
  return failed.length
    ? { status: 'success', message: `${base} ${failed.length} account${failed.length === 1 ? '' : 's'} failed: ${failed[0].error || 'unknown error'}` }
    : { status: 'success', message: base }
}

export async function startScan(): Promise<ScanState> {
  if (state.status === 'running') return state
  if (resetTimer) clearTimeout(resetTimer)
  set({ status: 'running', message: 'Scanning your AWS account. This can take a minute.' })
  let next: ScanState
  try {
    next = summarizeScan(await scanNow())
  } catch (e) {
    const err = toApiError(e)
    const d = describeError(err)
    next = { status: 'error', message: d.hint ? `${d.title}. ${d.hint}` : `${d.title}. ${d.message}` }
  }
  set(next)
  if (next.status === 'success' || next.status === 'queued') notifyDataChanged()
  resetTimer = setTimeout(() => set({ status: 'idle', message: '' }), 15_000)
  return next
}

export function useScan(): ScanState & { start: () => Promise<ScanState> } {
  const s = useSyncExternalStore(subscribe, () => state, () => state)
  return { ...s, start: startScan }
}
