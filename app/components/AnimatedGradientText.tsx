'use client'
import { motion } from 'framer-motion'

export default function AnimatedGradientText({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent inline-block ${className}`}
      style={{
        backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 30%, #c084fc 60%, #818cf8 100%)',
        backgroundSize: '200% auto',
      }}
      animate={{ backgroundPosition: ['0% center', '200% center'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  )
}
