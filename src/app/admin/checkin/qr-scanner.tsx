'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { checkInTicket, type CheckInResult } from './actions'

// Scan at ~5fps — sufficient for QR detection, far less CPU/battery than 60fps
const SCAN_INTERVAL_MS = 200

// Try native BarcodeDetector first (Chrome 83+, Safari 17+, all modern Android/iOS)
// Fall back to jsqr for older browsers
async function detectQR(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): Promise<string | null> {
  if ('BarcodeDetector' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      const barcodes = await detector.detect(video)
      if (barcodes.length > 0) return barcodes[0].rawValue as string
      return null
    } catch {
      // BarcodeDetector failed (e.g. format not supported) — fall through
    }
  }

  // jsqr fallback
  if (!video.videoWidth || !video.videoHeight) return null
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const jsQR = (await import('jsqr')).default
  return jsQR(imageData.data, imageData.width, imageData.height)?.data ?? null
}

async function getStream(): Promise<MediaStream> {
  // Prefer rear camera on mobile; fall back to any camera
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
    })
  } catch {
    return await navigator.mediaDevices.getUserMedia({ video: true })
  }
}

function getCameraErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Camera permission denied. Please allow camera access in your browser settings.'
    if (err.name === 'NotFoundError') return 'No camera found on this device.'
    if (err.name === 'NotReadableError') return 'Camera is in use by another app.'
    if (err.name === 'OverconstrainedError') return 'Camera constraints could not be satisfied.'
    if (err.name === 'SecurityError') return 'Camera access requires HTTPS.'
  }
  return 'Camera unavailable. Use manual entry below.'
}

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const cooldownRef = useRef(false)
  const lastScanRef = useRef(0)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleCode = useCallback(async (code: string) => {
    if (cooldownRef.current) return
    cooldownRef.current = true

    setLoading(true)
    setResult(null)
    const res = await checkInTicket(code)
    setResult(res)
    setLoading(false)

    setTimeout(() => { cooldownRef.current = false }, 3000)
  }, [])

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const now = Date.now()
    if (now - lastScanRef.current >= SCAN_INTERVAL_MS && !cooldownRef.current) {
      lastScanRef.current = now
      detectQR(video, canvas).then(data => {
        if (data) handleCode(data)
      })
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [handleCode])

  async function startScanner() {
    setCameraError(null)
    try {
      const stream = await getStream()
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        // play() is needed in addition to autoPlay for programmatic starts
        await video.play().catch(() => {
          // Some browsers block play() — the autoPlay attribute handles it
        })
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      setCameraError(getCameraErrorMessage(err))
    }
  }

  function stopScanner() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }

  useEffect(() => () => stopScanner(), [])

  return (
    <div className="space-y-6">
      {/* Camera scanner */}
      <div className="border border-white/[0.07] bg-white/[0.02] p-6 rounded-xl">
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-4">Camera scan</p>

        {/* Video container — overlay is relative to the video itself */}
        <div className="relative mb-4 w-full max-w-sm mx-auto">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`w-full rounded block ${scanning ? '' : 'hidden'}`}
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-2 border-swin-red/30 rounded" />
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-swin-red rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-swin-red rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-swin-red rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-swin-red rounded-br" />
                {/* Scan line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-swin-red/60 animate-scan-line" />
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {cameraError && (
          <p className="text-red-400 text-[13px] mb-3 leading-relaxed">{cameraError}</p>
        )}

        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold transition-colors rounded-lg"
          >
            Start camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full py-2.5 border border-white/15 text-white/50 hover:text-white text-[13px] transition-colors rounded-lg"
          >
            Stop camera
          </button>
        )}
      </div>

      {/* Result */}
      {(result || loading) && (
        <div className={`border p-6 rounded-xl transition-all ${
          loading ? 'border-white/10 bg-white/[0.02]' :
          result?.status === 'success' ? 'border-green-500/30 bg-green-500/10' :
          result?.status === 'already_used' ? 'border-yellow-500/30 bg-yellow-500/10' :
          'border-red-500/30 bg-red-500/10'
        }`}>
          {loading && <p className="text-white/50 text-[13px]">Checking…</p>}

          {!loading && result?.status === 'success' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-green-400 font-semibold text-[15px]">Checked in</span>
              </div>
              <p className="text-white text-[14px]">{result.name ?? 'Guest'}</p>
              <p className="text-white/50 text-[13px]">{result.eventTitle}</p>
              <p className="text-white/30 text-[12px]">{result.quantity} ticket{result.quantity > 1 ? 's' : ''}</p>
            </div>
          )}

          {!loading && result?.status === 'already_used' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <span className="text-yellow-400 font-semibold text-[15px]">Already used</span>
              </div>
              <p className="text-white text-[14px]">{result.name ?? 'Guest'}</p>
              <p className="text-white/50 text-[13px]">{result.eventTitle}</p>
              <p className="text-white/30 text-[12px]">Checked in at {new Date(result.checkedInAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
            </div>
          )}

          {!loading && result?.status === 'not_found' && (
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-400 font-semibold text-[15px]">Ticket not found</span>
            </div>
          )}

          {!loading && result?.status === 'error' && (
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-400 font-semibold text-[15px]">{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
