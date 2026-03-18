'use client'

import { useEffect, useRef, useState } from 'react'

const TIMINGS = [
  1200,  // 0→1: logo hold
  3000,  // 1→2: statement 1
  5200,  // 2→3: cost spike
  7200,  // 3→4: statement 2 + logo mark
  8800,  // 4→exit
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
  const [step, setStep] = useState(0)
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
          setStep(i + 1)
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
