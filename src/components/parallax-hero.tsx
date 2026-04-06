'use client'

import { useEffect, useRef } from 'react'

export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    let rafId: number

    function update() {
      if (!el) return
      // Negative translateY — image moves up as you scroll, never reveals black at top.
      // scale(1.2) gives 20% overflow so the image always covers the section.
      el.style.transform = `translateY(${-window.scrollY * 0.3}px) scale(1.2)`
    }

    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => { update(); rafId = 0 })
    }

    update() // set immediately on mount — no flash
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={bgRef} className="absolute inset-0 will-change-transform">
      {children}
    </div>
  )
}
