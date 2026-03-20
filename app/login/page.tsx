import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cl-login-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#cl-login-bg)" />
      <circle cx="12" cy="21" r="3.5" fill="white" />
      <circle cx="28" cy="21" r="3.5" fill="white" />
      <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 21 C10 11, 30 11, 30 21" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default async function LoginPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <a href="/" className="flex items-center gap-3 mb-8 group w-fit">
          <Logo size={34} />
          <span className="text-gray-900 font-bold text-xl tracking-tight">Cloudlink</span>
        </a>

        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-lg border border-gray-200 rounded-2xl',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-500',
              socialButtonsBlockButton: 'border-gray-200 text-gray-700 hover:bg-gray-50',
              formButtonPrimary: 'bg-green-600 hover:bg-green-700 shadow-none',
              formFieldInput: 'border-gray-200 focus:ring-green-500 focus:border-green-500',
              footerActionLink: 'text-green-600 hover:text-green-700',
            },
          }}
        />

        <p className="text-gray-400 text-xs text-center mt-6">
          © {new Date().getFullYear()} Cloudlink Global · All rights reserved
        </p>
      </div>
    </div>
  )
}
