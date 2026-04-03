import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Cloud, DollarSign, GitBranch } from 'lucide-react'

type SignUpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getRedirectTarget(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value

  if (!candidate || !candidate.startsWith('/dashboard')) {
    return '/dashboard'
  }

  return candidate
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const redirectTarget = getRedirectTarget(resolvedSearchParams?.redirect_url)

  return (
    <div
      className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 18% 12%, rgba(16,185,129,0.12) 0%, transparent 34%), radial-gradient(circle at 84% 76%, rgba(5,150,105,0.12) 0%, transparent 32%)',
        }}
      />

      <div className="relative hidden border-r border-[#1E2D4F] lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-16">
        <div>
          <Link href="/" className="group flex w-fit items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 24px rgba(16,185,129,0.28)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="none"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F1F5F9]">Cloudlink</span>
          </Link>
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">Get started</p>
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#F1F5F9]">
            Connect your cloud and turn cost visibility into action.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#94A3B8]">
            Set up Cloudlink in minutes, establish your baseline, and start catching regressions before they compound into budget surprises.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              { icon: Cloud, title: 'Read-only onboarding', body: 'Connect AWS, Azure, or GCP with the least-privilege roles and clear verification steps.' },
              { icon: GitBranch, title: 'Deploy attribution', body: 'Tie regressions to the deploy, version, or service responsible so engineering can respond quickly.' },
              { icon: DollarSign, title: 'Performance-based pricing', body: 'You pay 15% of verified savings. No subscription tiers, no upfront contract, no hidden platform tax.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629]/80 px-5 py-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                    <item.icon size={16} />
                  </div>
                  <p className="font-semibold text-[#F1F5F9]">{item.title}</p>
                </div>
                <p className="text-sm leading-7 text-[#94A3B8]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#64748B]">The fastest path from “why did spend spike?” to “here’s the change that caused it.”</p>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2.5 mb-8 group w-fit lg:hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="none"/>
            </svg>
          </div>
          <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.01em' }}>
            Cloudlink
          </span>
        </Link>

        <SignUp
          forceRedirectUrl={redirectTarget}
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorBackground: '#0F1629',
              colorInputBackground: '#0A0E1A',
              colorText: '#F1F5F9',
              colorTextSecondary: '#94A3B8',
              colorTextOnPrimaryBackground: '#ffffff',
              colorPrimary: '#10B981',
              colorDanger: '#EF4444',
              colorSuccess: '#10B981',
              colorNeutral: '#94A3B8',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
            },
            elements: {
              rootBox: 'w-full',
              card: 'shadow-2xl',
              headerTitle: { color: '#F1F5F9', fontWeight: '700' },
              headerSubtitle: { color: '#94A3B8' },
              socialButtonsBlockButton: {
                border: '1px solid #1E2D4F',
                backgroundColor: '#141C33',
                color: '#E2E8F0',
              },
              socialButtonsBlockButtonText: { color: '#E2E8F0' },
              dividerLine: { backgroundColor: '#1E2D4F' },
              dividerText: { color: '#475569' },
              formFieldLabel: { color: '#94A3B8' },
              formFieldInput: {
                border: '1px solid #1E2D4F',
                backgroundColor: '#0A0E1A',
                color: '#F1F5F9',
              },
              formButtonPrimary: {
                backgroundColor: '#10B981',
                color: '#ffffff',
              },
              footerActionText: { color: '#94A3B8' },
              footerActionLink: { color: '#10B981' },
              identityPreviewText: { color: '#94A3B8' },
              identityPreviewEditButton: { color: '#10B981' },
              alertText: { color: '#94A3B8' },
              formResendCodeLink: { color: '#10B981' },
            },
          }}
        />

        <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
          © {new Date().getFullYear()} Cloudlink Global · All rights reserved
        </p>
      </div>
      </div>
    </div>
  )
}
