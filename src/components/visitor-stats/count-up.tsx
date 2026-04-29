'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
}

export function CountUp({ value, duration = 1200 }: Props) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      queueMicrotask(() => setDisplay(value))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || hasRun.current) continue
          hasRun.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const t = Math.min(1, elapsed / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(value * eased))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display.toLocaleString()}</span>
}
