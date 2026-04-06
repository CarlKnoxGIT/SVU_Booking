'use client'

import { useEffect, useRef } from 'react'

const FRAME_COUNT = 44
const BASE_URL = 'https://outreach.ozgrav.org/portal2/wp-content/grand-media/image/SaturnAnim'

function pad(n: number) {
  return n.toString().padStart(4, '0')
}

export function SaturnAnimation({ children }: { children?: React.ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const frameDims = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      paint(currentFrameRef.current)
    }

    function paint(index: number) {
      if (!canvas || !ctx) return
      let i = index
      while (i >= 0 && (!framesRef.current[i]?.complete || !framesRef.current[i]?.naturalWidth)) i--
      if (i < 0) return
      const img = framesRef.current[i]
      if (!frameDims.current.w) {
        frameDims.current = { w: img.naturalWidth, h: img.naturalHeight }
      }
      const { w: fw, h: fh } = frameDims.current
      const cw = canvas.width, ch = canvas.height
      const scale = Math.max(cw / fw, ch / fh)
      ctx.drawImage(img, (cw - fw * scale) / 2, (ch - fh * scale) / 2, fw * scale, fh * scale)
    }

    function onScroll() {
      if (!section) return
      const rect = section.getBoundingClientRect()
      const scrolled = -rect.top
      const scrollable = section.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrolled / scrollable))

      // Advance frame
      const frame = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT))
      if (frame !== currentFrameRef.current) {
        currentFrameRef.current = frame
        paint(frame)
      }

      // Fade text in from 50% scroll progress
      if (textRef.current) {
        const t = Math.max(0, Math.min(1, (progress - 0.5) / 0.35))
        textRef.current.style.opacity = String(t)
      }

      // Fade scroll hint out as soon as they start scrolling
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - progress * 10))
      }
    }

    // Preload all frames
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.src = BASE_URL + pad(i) + '.jpg'
      img.onload = () => {
        if (i === 0) { resize(); onScroll() }
        else paint(currentFrameRef.current)
      }
      framesRef.current[i] = img
    }

    resize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Animation canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Bottom gradient so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

        {/* Overview text — fades in at 50% scroll */}
        <div
          ref={textRef}
          className="absolute bottom-0 left-0 right-0 px-10 sm:px-20 pb-20 z-10"
          style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
        >
          {children}
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ transition: 'opacity 0.3s ease' }}
        >
          <span className="text-[11px] tracking-[0.18em] text-white/40 uppercase">Scroll</span>
          <div className="w-px h-6 bg-white/30 animate-pulse" />
        </div>

      </div>
    </section>
  )
}
