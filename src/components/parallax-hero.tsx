'use client'

import { useEffect, useRef } from 'react'

export function ParallaxHero({ children }: { children: React.ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    let rafId: number
    let lastScrollY = window.scrollY

    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        lastScrollY = window.scrollY
        if (el) {
          // Move background up at 40% scroll rate for parallax depth
          el.style.transform = `translateY(${lastScrollY * 0.4}px) scale(1.02)`
        }
        rafId = 0
      })
    }

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
