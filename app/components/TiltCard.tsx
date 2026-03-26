'use client'

export default function TiltCard({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
