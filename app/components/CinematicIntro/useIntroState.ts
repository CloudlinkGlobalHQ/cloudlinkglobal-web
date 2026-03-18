'use client'

import { useEffect, useRef, useState } from 'react'

const TIMINGS = [
  1800,  // 1→2: statement 1
  4000,  // 2→3: cost spike
  6000,  // 3→4: final statement
  7600,  // 4→exit
]

function lockScroll() {
  window.scrollTo(0, 0)
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

function unlockScroll() {
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  window.scrollTo(0, 0)
}

export function useIntroState() {
  const [step, setStep] = useState(1)
  const [exit, setExit] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const triggerExit = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    window.scrollTo(0, 0)
    setExit(true)
    const t = setTimeout(() => {
      unlockScroll()
      setDone(true)
    }, 950)
    timers.current.push(t)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    lockScroll()

    TIMINGS.forEach((ms, i) => {
      const t = setTimeout(() => {
        if (i < TIMINGS.length - 1) {
          setStep(i + 2) // steps 1→2→3→4
        } else {
          triggerExit()
        }
      }, ms)
      timers.current.push(t)
    })

    return () => {
      timers.current.forEach(clearTimeout)
      unlockScroll()
    }
  }, [])

  const handleSkip = () => triggerExit()

  return { step, exit, done, handleSkip }
}
