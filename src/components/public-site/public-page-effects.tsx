'use client'

import { useEffect } from 'react'

export function PublicPageEffects() {
  useEffect(() => {
    const root = document.querySelector('.svu-public')
    if (!root) return

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>('[data-reveal-line], [data-reveal-media], [data-reveal-block]')
    )
    targets.forEach((target) => {
      if (target.hasAttribute('data-reveal-line')) target.classList.add('reveal-line')
      if (target.hasAttribute('data-reveal-media')) target.classList.add('reveal-media')
      if (target.hasAttribute('data-reveal-block')) target.classList.add('reveal-block')
    })
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    targets.forEach((target, index) => {
      target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 70}ms`)
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [])

  return null
}
