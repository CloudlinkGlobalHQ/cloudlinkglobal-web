'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { CreditCard, KeyRound, Lock, ShieldCheck, Users, Webhook } from 'lucide-react'
import { useSubscription } from '../../components/SubscriptionProvider'

const cards = [
  {
    title: 'Cloud Credentials',
    href: '/dashboard/credentials',
    description: 'Connect AWS, Azure, or GCP and manage verification.',
    icon: Lock,
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    description: 'Manage your plan, payment method, and savings-based billing.',
    icon: CreditCard,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    description: 'Invite teammates and manage access levels.',
    icon: Users,
  },
  {
    title: 'API Keys',
    href: '/dashboard/api-keys',
    description: 'Create API keys for automation, integrations, and MCP access.',
    icon: KeyRound,
  },
  {
    title: 'Webhooks',
    href: '/dashboard/webhooks',
    description: 'Configure webhook delivery and Slack alerting.',
    icon: Webhook,
  },
  {
    title: 'Audit Log',
    href: '/dashboard/audit',
    description: 'Review configuration changes, actions, and system activity.',
    icon: ShieldCheck,
  },
]

export default function SettingsPage() {
  const { user } = useUser()
  const { subscription, plan, limits } = useSubscription()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#1E2D4F] bg-[#0F1629] p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3D5070]">Workspace Settings</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F1F5F9]">Settings & Access</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
              Manage your workspace configuration, billing, integrations, and team access from one place.
            </p>
          </div>
          <div className="rounded-2xl border border-[#1E2D4F] bg-[#141C33] px-4 py-3 text-sm text-[#CBD5E1]">
            <div className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'Signed in'}</div>
            <div className="mt-1 text-xs text-[#64748B]">
              Plan: <span className="text-[#10B981]">{plan}</span>
              {' '}· Team seats: {Number.isFinite(limits.teamSeats) ? limits.teamSeats : 'Unlimited'}
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
