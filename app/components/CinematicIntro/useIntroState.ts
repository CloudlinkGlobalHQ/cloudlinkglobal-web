'use client'

import { useEffect, useRef, useState } from 'react'

const TIMINGS = [
  1200,  // 0→1: logo hold
  3000,  // 1→2: statement 1
  5200,  // 2→3: cost spike
  7200,  // 3→4: statement 2 + logo mark
  8800,  // 4→exit
]

export function useIntroState() {
  const [step, setStep] = useState(0)
  const [exit, setExit] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const triggerExit = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setExit(true)
    const t = setTimeout(() => {
      sessionStorage.setItem('cl_intro_seen', '1')
      document.body.style.overflow = ''
      setDone(true)
    }, 950)
    timers.current.push(t)
  }

  useEffect(() => {
    if (sessionStorage.getItem('cl_intro_seen') === '1') {
      setDone(true)
      return
    }

    document.body.style.overflow = 'hidden'

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

  const handleSkip = () => triggerExit()

  return { step, exit, done, handleSkip }
}
