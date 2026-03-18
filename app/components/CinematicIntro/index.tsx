'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIntroState } from './useIntroState'

const E = [0.22, 1, 0.36, 1] as const
const EXIT_EASE = [0.76, 0, 0.24, 1] as const

// ─── Word-by-word reveal (fade + rise, no clipping) ───
function WordReveal({
  text,
  delayStart = 0,
  className = '',
  style,
}: {
  text: string
  delayStart?: number
  className?: string
  style?: React.CSSProperties
}) {
  const words = text.split(' ')
  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: delayStart + i * 0.07, ease: E }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Beat 0: Logo draw ───
function LogoDrawBeat() {
  return (
    <motion.div
      key="logo-draw"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: E }}
      className="flex flex-col items-center gap-4"
    >
      {/* Animated SVG logo icon — strokes draw in */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ci-bg-beat0" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Background rect draws in */}
        <motion.rect
          width="40" height="40" rx="10"
          fill="url(#ci-bg-beat0)"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: E }}
        />
        {/* Left dot */}
        <motion.circle
          cx="12" cy="21" r="3.5" fill="white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3, ease: E }}
        />
        {/* Right dot */}
        <motion.circle
          cx="28" cy="21" r="3.5" fill="white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.45, ease: E }}
        />
        {/* Connecting line — strokes in */}
        <motion.line
          x1="15.5" y1="21" x2="24.5" y2="21"
          stroke="white" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55, ease: E }}
        />
        {/* Arc above */}
        <motion.path
          d="M10 21 C10 11, 30 11, 30 21"
          stroke="white" strokeOpacity="0.45" strokeWidth="1.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.65, ease: E }}
        />
      </svg>

      {/* Wordmark types in */}
      <motion.div className="flex items-center gap-0 overflow-hidden">
        {'Cloudlink'.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.06, ease: E }}
            style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.025em' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Beat 1: Text statement ───
function TextBeat({ text, delayStart = 0.1 }: { text: string; delayStart?: number }) {
  const lines = text.split('\n')
  return (
    <motion.div
      key={text}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '0 1.5rem', maxWidth: 680 }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ marginTop: li > 0 ? '0.15em' : 0 }}>
          <WordReveal
            text={line}
            delayStart={delayStart + li * 0.3}
            className="text-white"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15 }}
          />
        </div>
      ))}
    </motion.div>
  )
}

// ─── Beat 2: Cost Spike counter ───
function CostSpikeBeat() {
  const [phase, setPhase] = useState<'before' | 'counting' | 'after'>('before')
  const [count, setCount] = useState(2400)

  useEffect(() => {
    // Start counting after 0.4s
    const t1 = setTimeout(() => setPhase('counting'), 400)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'counting') return
    const target = 8600
    const duration = 1400
    const startTime = performance.now()
    const startVal = 2400

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.round(startVal + eased * (target - startVal))
      setCount(current)
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setPhase('after')
      }
    }
    requestAnimationFrame(tick)
  }, [phase])

  return (
    <motion.div
      key="cost-spike"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: E }}
      className="flex flex-col items-center gap-5 text-center px-6"
    >
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[11px] font-semibold uppercase tracking-widest text-white/35"
      >
        Monthly AWS spend · api-service · after deploy #247
      </motion.div>

      {/* Counter */}
      <div className="flex items-baseline gap-4">
        <motion.span
          animate={{ opacity: phase === 'before' ? 1 : 0.25 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
        >
          ${count < 2600 ? '2,400' : count.toLocaleString()}
        </motion.span>

        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: phase === 'counting' ? 1 : 0 }}
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}
        >
          →
        </motion.span>

        <motion.span
          animate={{
            opacity: phase !== 'before' ? 1 : 0,
            scale: phase === 'after' ? [1, 1.06, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: phase === 'after' ? '#f87171' : 'white',
            letterSpacing: '-0.04em',
            textShadow: phase === 'after' ? '0 0 40px rgba(248,113,113,0.6)' : 'none',
            transition: 'color 0.3s, text-shadow 0.3s',
          }}
        >
          ${count.toLocaleString()}
        </motion.span>
      </div>

      {/* SPIKE DETECTED pill */}
      <AnimatePresence>
        {phase === 'after' && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: E }}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-red-400"
              style={{ boxShadow: '0 0 8px rgba(248,113,113,0.9)' }}
            />
            <span className="text-sm font-semibold text-red-300 tracking-wide">+258% SPIKE DETECTED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Beat 3: Final statement with logo mark ───
function FinalBeat() {
  return (
    <motion.div
      key="final-beat"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-8 text-center px-6 max-w-2xl"
    >
      <WordReveal
        text="Cloudlink finds it before the bill arrives."
        delayStart={0.05}
        className="text-white"
        style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15 }}
      />

      {/* Small logo mark appears below */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: E }}
        className="flex items-center gap-2 opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="ci-bg-beat3" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#ci-bg-beat3)" />
          <circle cx="12" cy="21" r="3.5" fill="white" />
          <circle cx="28" cy="21" r="3.5" fill="white" />
          <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 21 C10 11, 30 11, 30 21" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Cloudlink Global</span>
      </motion.div>
    </motion.div>
  )
}

// ─── Beat 4: Full logo + tagline + scan line ───
function EndLogoBeat() {
  return (
    <motion.div
      key="end-logo"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: E }}
      className="flex flex-col items-center gap-4"
      style={{ position: 'relative' }}
    >
      <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="ci-bg-beat4" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#ci-bg-beat4)" />
        <circle cx="12" cy="21" r="3.5" fill="white" />
        <circle cx="28" cy="21" r="3.5" fill="white" />
        <line x1="15.5" y1="21" x2="24.5" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 21 C10 11, 30 11, 30 21" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      <div style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.025em' }}>
        Cloudlink
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: E }}
        style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', fontWeight: 500 }}
      >
        Deploy-aware AWS cost intelligence
      </motion.p>

      {/* Scan line that sweeps across */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0.8 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(139,92,246,0.8), transparent)',
          transformOrigin: 'left center',
        }}
      />
    </motion.div>
  )
}

// ─── Ambient background ───
function Background() {
  return (
    <>
      {/* Dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-40" />

      {/* Orb 1 — center indigo breathing */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 800, height: 800,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb 2 — violet upper left drift */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 500, height: 500,
          left: '20%', top: '20%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb 3 — purple lower right drift */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 400, height: 400,
          right: '15%', bottom: '20%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Horizontal grid lines — very subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 49px, rgba(99,102,241,0.04) 50px)',
          backgroundSize: '100% 50px',
        }}
      />
    </>
  )
}

// ─── Main component ───
export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const { step, exit, done, handleSkip } = useIntroState()

  useEffect(() => {
    if (done) onComplete()
  }, [done, onComplete])

  if (done) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#040410] flex items-center justify-center overflow-hidden"
      animate={{
        clipPath: exit ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)',
      }}
      transition={{ duration: 0.9, ease: EXIT_EASE }}
    >
      <Background />

      {/* Progress bar at top */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
        initial={{ width: '0%' }}
        animate={{ width: exit ? '100%' : `${(step / 4) * 100}%` }}
        transition={{ duration: exit ? 0.3 : 0.8, ease: E }}
      />

      {/* Center beat content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {step === 0 && <LogoDrawBeat key="step0" />}
          {step === 1 && (
            <TextBeat
              key="step1"
              text="Your deploys are costing you."
              delayStart={0.05}
            />
          )}
          {step === 2 && <CostSpikeBeat key="step2" />}
          {step === 3 && <FinalBeat key="step3" />}
          {step === 4 && <EndLogoBeat key="step4" />}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <AnimatePresence>
        {step >= 1 && !exit && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
            className="fixed bottom-6 right-6 z-[60] text-xs text-white/25 hover:text-white/55 transition-colors tracking-widest uppercase"
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
