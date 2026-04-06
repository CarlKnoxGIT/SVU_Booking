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
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const frameDims = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const textEl = textRef.current
    if (!canvas || !section || !textEl) return
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
      if (!section || !textEl) return
      const rect = section.getBoundingClientRect()
      const scrolled = -rect.top
      const scrollable = section.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrolled / scrollable))

      // Animation frame scrub
      const frame = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT))
      if (frame !== currentFrameRef.current) {
        currentFrameRef.current = frame
        paint(frame)
      }

      // Parallax — begins as soon as section enters the viewport (rect.top < vh),
      // not just once the sticky phase starts. Spreads motion over the full section height.
      const viewportH = window.innerHeight
      const parallaxProgress = Math.max(0, Math.min(1, (viewportH - rect.top) / section.offsetHeight))
      textEl.style.transform = `translateY(${parallaxProgress * -90}px)`
    }

    // Preload — paint frame 0 as soon as it arrives
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
    <section ref={sectionRef} className="relative" style={{ height: '160vh', marginTop: '-20vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* Text — lower center with parallax drift */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[38vh] px-6 text-center z-10 pointer-events-none">
          <div ref={textRef} style={{ willChange: 'transform' }}>
            {children}
          </div>
        </div>

      </div>
    </section>
  )
}
