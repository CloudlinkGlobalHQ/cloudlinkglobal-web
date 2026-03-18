'use client'

import { useEffect, useRef, useState } from 'react'

const TIMINGS = [
  1000,  // step 0 → 1  (logo hold → statement 1)
  2700,  // step 1 → 2
  4600,  // step 2 → 3
  6500,  // step 3 → 4  (final logo + tagline)
  7900,  // step 4 → exit (trigger clip-wipe)
]

export function useIntroState() {
  const [step, setStep]   = useState(0)
  const [exit, setExit]   = useState(false)
  const [done, setDone]   = useState(false)
  const [skip, setSkip]   = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const triggerExit = () => {
    // Clear pending timers
    timers.current.forEach(clearTimeout)
    setExit(true)
    timers.current = [
      setTimeout(() => {
        sessionStorage.setItem('cl_intro_seen', '1')
        document.body.style.overflow = ''
        setDone(true)
      }, 900),
    ]
  }

  useEffect(() => {
    // If already seen this session, skip immediately
    if (sessionStorage.getItem('cl_intro_seen') === '1') {
      setDone(true)
      return
    }

    // Lock scroll during intro
    document.body.style.overflow = 'hidden'

    // Queue the step advances
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
      document.body.style.overflow = ''
    }
  }, [])

  const handleSkip = () => {
    setSkip(true)
    triggerExit()
  }

  return { step, exit, done, skip, handleSkip }
}
