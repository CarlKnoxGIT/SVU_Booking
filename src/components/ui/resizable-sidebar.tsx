'use client'

import { useEffect, useRef, useState } from 'react'

const MIN_WIDTH = 140
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 208 // w-52

interface ResizableSidebarProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  mainClassName?: string
  storageKey?: string
}

export function ResizableSidebar({
  sidebar,
  children,
  mainClassName = 'flex-1 overflow-y-auto',
  storageKey = 'sidebar-width',
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  // Restore persisted width on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const n = Number(stored)
      if (n >= MIN_WIDTH && n <= MAX_WIDTH) setWidth(n)
    }
  }, [storageKey])

  // Close mobile drawer when resized to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + e.clientX - startX.current))
      setWidth(next)
    }
    function onMouseUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setWidth(w => {
        localStorage.setItem(storageKey, String(w))
        return w
      })
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [storageKey])

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Hamburger button — mobile only */}
      <button
        className="md:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-white/60 hover:text-white transition-colors"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <aside
        style={{ width }}
        className="hidden md:flex flex-col flex-shrink-0 relative border-r border-white/[0.06] overflow-hidden"
      >
        {sidebar}

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group flex items-center justify-center"
          title="Drag to resize"
        >
          <div className="w-px h-full bg-white/[0.06] group-hover:bg-white/20 transition-colors duration-150" />
          <div className="absolute flex flex-col gap-[3px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-white/40" />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-black border-r border-white/[0.06] overflow-hidden transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <main className={`${mainClassName} min-w-0`}>{children}</main>
    </div>
  )
}
