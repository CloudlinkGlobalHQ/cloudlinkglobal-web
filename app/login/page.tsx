import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 group w-fit">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/>
            </svg>
          </div>
          <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.01em' }}>
            Cloudlink
          </span>
        </Link>

        <SignIn
          forceRedirectUrl="/dashboard"
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
  )
}
