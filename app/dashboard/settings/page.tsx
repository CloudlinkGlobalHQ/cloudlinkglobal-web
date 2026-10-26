'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { CreditCard, Lock, ShieldCheck, Webhook } from 'lucide-react'
import { useSubscription } from '../../components/SubscriptionProvider'

const cards = [
  {
    title: 'Cloud Credentials',
    href: '/dashboard/credentials',
    description: 'Connect your AWS account with a read-only IAM role and check that it still works.',
    icon: Lock,
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    description: 'The fall 2026 pilot is free. See how pricing will work after the pilot.',
    icon: CreditCard,
  },
  {
    title: 'Webhooks & Slack',
    href: '/dashboard/webhooks',
    description: 'Get a POST request or a Slack message when a scan finishes.',
    icon: Webhook,
  },
  {
    title: 'Scan history',
    href: '/dashboard/scans',
    description: 'See every scan, which regions it covered and whether it failed.',
    icon: ShieldCheck,
  },
]

export default function SettingsPage() {
  const { user } = useUser()
  const { subscription, isPaid, plan } = useSubscription()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#1E2D4F] bg-[#0F1629] p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3D5070]">Workspace Settings</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F1F5F9]">Settings & Access</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
              Manage your AWS connection, notifications and billing.
            </p>
          </div>
          <div className="rounded-2xl border border-[#1E2D4F] bg-[#141C33] px-4 py-3 text-sm text-[#CBD5E1]">
            <div className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'Signed in'}</div>
            <div className="mt-1 text-xs text-[#64748B]">
              Plan: <span className="text-[#10B981]">{isPaid ? plan : 'Free pilot'}</span> · read-only
            </div>
            {subscription?.current_period_end && (
              <div className="mt-1 text-xs text-[#64748B]">
                Current period ends {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, href, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5 transition hover:border-[#10B981]/40 hover:bg-[#121B31]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-xl border border-[#1E2D4F] bg-[#141C33] p-2.5 text-[#10B981]">
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium text-[#64748B] transition group-hover:text-[#10B981]">Open</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#F1F5F9]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
