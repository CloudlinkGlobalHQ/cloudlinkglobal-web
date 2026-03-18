'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useIntroState } from './useIntroState'

const E = [0.22, 1, 0.36, 1] as const
const EXIT_EASE = [0.76, 0, 0.24, 1] as const

const STATEMENTS = [
  null, // step 0: logo only
  'Your cloud is exposed.',
  'Every open port. Every idle resource.\nEvery misconfiguration.',
  'Cloudlink finds it.\nCloudlink fixes it.\nAutomatically.',
  null, // step 4: logo + tagline
]

function TextBeat({ text }: { text: string }) {
  return (
    <motion.p
      key={text}
      initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
      transition={{ duration: 0.7, ease: E }}
      style={{
        fontSize: 'clamp(1.6rem, 4.5vw, 3rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        textAlign: 'center',
        maxWidth: 700,
        whiteSpace: 'pre-line',
      }}
      className="text-white px-6"
    >
      {text}
    </motion.p>
  )
}

function LogoBeat({ showTagline }: { showTagline: boolean }) {
  return (
    <motion.div
      key="logo-beat"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: E }}
      className="flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
          <span className="text-white font-bold text-2xl">C</span>
        </div>
        <span className="text-white font-bold text-4xl tracking-tight">Cloudlink</span>
      </div>
      <AnimatePresence>
        {showTagline && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: E }}
            className="text-white/50 text-lg font-medium tracking-wide"
          >
            AI-powered cloud remediation
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const { step, exit, done, handleSkip } = useIntroState()

  // When done, notify parent and unmount
  if (done) {
    onComplete()
    return null
  }

  const currentText = STATEMENTS[step]
  const isLogoStep = step === 0 || step === 4

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      animate={{
        clipPath: exit ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)',
      }}
      transition={{ duration: 0.85, ease: EXIT_EASE }}
    >
      {/* Ambient grid background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: E }}
        style={{
          backgroundImage: `
            radial-gradient(ellipse 55% 40% at 50% 50%, rgba(99,102,241,0.15), transparent),
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        }}
      />

      {/* Slow indigo pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(99,102,241,0.12), transparent)',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {isLogoStep ? (
            <LogoBeat key={`logo-${step}`} showTagline={step === 4} />
          ) : currentText ? (
            <TextBeat key={currentText} text={currentText} />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <AnimatePresence>
        {step >= 1 && !exit && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleSkip}
            className="fixed bottom-6 right-6 z-60 text-xs text-white/30 hover:text-white/70 transition-colors duration-200 tracking-wide"
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
