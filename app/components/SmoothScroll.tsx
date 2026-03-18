'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Don't start Lenis until the intro has finished (overflow is restored)
    const introSeen = sessionStorage.getItem('cl_intro_seen') === '1'
    const delay = introSeen ? 0 : 10000 // wait past intro duration

    const startLenis = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      lenisRef.current = lenis

      function raf(time: number) {
        lenis.raf(time)
        rafRef.current = requestAnimationFrame(raf)
      }
      rafRef.current = requestAnimationFrame(raf)
    }

    const timer = setTimeout(startLenis, delay)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(rafRef.current)
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}
