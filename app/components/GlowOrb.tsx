'use client'
import { motion } from 'framer-motion'

export default function GlowOrb({
  color = 'indigo',
  size = 600,
  x = '50%',
  y = '50%',
  opacity = 0.15,
  blur = 120,
  animate = true
}: {
  color?: 'indigo' | 'violet' | 'purple' | 'blue'
  size?: number
  x?: string
  y?: string
  opacity?: number
  blur?: number
  animate?: boolean
}) {
  const colors = {
    indigo: 'rgba(99,102,241,VAL)',
    violet: 'rgba(139,92,246,VAL)',
    purple: 'rgba(168,85,247,VAL)',
    blue: 'rgba(59,130,246,VAL)',
  }
  const fill = colors[color].replace('VAL', String(opacity))

  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${fill} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
      animate={animate ? {
        scale: [1, 1.08, 1],
        opacity: [0.7, 1, 0.7],
      } : undefined}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
