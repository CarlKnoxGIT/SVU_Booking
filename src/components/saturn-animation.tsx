'use client'

import { useEffect, useRef } from 'react'

const FRAME_COUNT = 44
const FPS = 12
const BASE_URL = 'https://outreach.ozgrav.org/portal2/wp-content/grand-media/image/SaturnAnim'

function pad(n: number) {
  return n.toString().padStart(4, '0')
}

export function SaturnAnimation({ children }: { children?: React.ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const frameDims = useRef({ w: 0, h: 0 })
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const isVisibleRef = useRef(false)

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

    function tick(time: number) {
      if (!isVisibleRef.current) return
      rafRef.current = requestAnimationFrame(tick)
      if (time - lastTimeRef.current < 1000 / FPS) return
      lastTimeRef.current = time
      currentFrameRef.current = (currentFrameRef.current + 1) % FRAME_COUNT
      paint(currentFrameRef.current)
    }

    // Start/stop playback based on visibility
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
      })
    }, { threshold: 0.1 })

    observer.observe(section)

    // Preload frames — paint frame 0 as soon as it arrives
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.src = BASE_URL + pad(i) + '.jpg'
      img.onload = () => {
        if (i === 0) { resize(); paint(0) }
      }
      framesRef.current[i] = img
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[600px] overflow-hidden">

      {/* Animation canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Text — centered, upper third */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[18vh] px-6 text-center z-10">
        {children}
      </div>

    </section>
  )
}
