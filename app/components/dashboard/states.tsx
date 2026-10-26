'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { AlertTriangle, Clock, Inbox, Loader2 } from 'lucide-react'
import type { ApiError } from '../../lib/api'
import { describeError } from '../../lib/errors'

const PANEL = 'rounded-2xl border border-[#1E2D4F] bg-[#0F1629]'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" data-testid="loading-state" className={`${PANEL} flex items-center justify-center gap-3 p-10 text-sm text-slate-400`}>
      <Loader2 size={18} className="animate-spin text-[#10B981]" aria-hidden />
      {label}
    </div>
  )
}

export function ErrorState({ error, onRetry, compact = false }: { error: ApiError; onRetry?: () => void; compact?: boolean }) {
  const copy = describeError(error)
  return (
    <div role="alert" data-testid="error-state" className={`${PANEL} border-red-500/30 ${compact ? 'p-4' : 'p-8'} text-sm`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">{copy.title}</p>
          <p className="mt-1 text-slate-400">{copy.message}</p>
          {copy.hint && <p className="mt-1 text-slate-400">{copy.hint}</p>}
          {onRetry && (
            <button type="button" onClick={onRetry} className="dashboard-secondary-button mt-4 px-4 py-2 text-sm">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

type Action = { label: string; href: string } | { label: string; onClick: () => void; disabled?: boolean }

export function ActionButton({ action, primary = true }: { action: Action; primary?: boolean }) {
  const cls = `${primary ? 'dashboard-primary-button' : 'dashboard-secondary-button'} inline-flex px-4 py-2 text-sm disabled:opacity-50`
  return 'href' in action
    ? <Link href={action.href} className={cls}>{action.label}</Link>
    : <button type="button" onClick={action.onClick} disabled={action.disabled} className={cls}>{action.label}</button>
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: Action }) {
  return (
    <div data-testid="empty-state" className={`${PANEL} p-10 text-center`}>
      <Inbox size={28} className="mx-auto mb-3 text-slate-500" aria-hidden />
      <p className="font-semibold text-slate-100">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{body}</p>}
      {action && <div className="mt-5"><ActionButton action={action} /></div>}
    </div>
  )
}

/** A feature that exists in the product plan but has no working backend yet. */
export function ComingSoon({ title, what, why }: { title: string; what: string; why: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={what} />
      <div data-testid="coming-soon" className={`${PANEL} p-8`}>
        <div className="flex items-start gap-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="font-semibold text-slate-100">
              Coming soon <span className="ml-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">Not live yet</span>
            </p>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{why}</p>
            <div className="mt-5"><ActionButton action={{ label: 'Back to overview', href: '/dashboard' }} primary={false} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A route that is kept so old links work, but has no feature behind it. */
export function NotAvailable({ title, why }: { title: string; why: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div data-testid="not-available" className={`${PANEL} p-8`}>
        <p className="font-semibold text-slate-100">Not available yet</p>
        <p className="mt-2 max-w-xl text-sm text-slate-400">{why}</p>
        <div className="mt-5"><ActionButton action={{ label: 'Back to overview', href: '/dashboard' }} primary={false} /></div>
      </div>
    </div>
  )
}
