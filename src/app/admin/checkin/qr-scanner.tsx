'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { checkInTicket, type CheckInResult } from './actions'

// Scan at ~5fps — sufficient for QR detection, far less CPU/battery than 60fps
const SCAN_INTERVAL_MS = 200
// After a successful scan, wait this long before accepting another scan
const COOLDOWN_MS = 2500

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
      // BarcodeDetector failed — fall through to jsqr
    }
  }

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
    if (err.name === 'NotAllowedError') return 'Camera permission denied. Allow camera access in your browser settings.'
    if (err.name === 'NotFoundError') return 'No camera found on this device.'
    if (err.name === 'NotReadableError') return 'Camera is in use by another app.'
    if (err.name === 'SecurityError') return 'Camera access requires HTTPS.'
  }
  return 'Camera unavailable.'
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
  const [scanCount, setScanCount] = useState(0)

  const handleCode = useCallback(async (code: string) => {
    if (cooldownRef.current) return
    cooldownRef.current = true

    setLoading(true)
    const res = await checkInTicket(code)
    setResult(res)
    setScanCount(n => n + 1)
    setLoading(false)

    setTimeout(() => { cooldownRef.current = false }, COOLDOWN_MS)
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
    setResult(null)
    try {
      const stream = await getStream()
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play().catch(() => {})
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

  function scanNext() {
    cooldownRef.current = false
    setResult(null)
    setLoading(false)
  }

  useEffect(() => () => stopScanner(), [])

  const statusColour = !result ? '' :
    result.status === 'success' ? 'border-emerald-500/40 bg-emerald-500/[0.08]' :
    result.status === 'already_used' ? 'border-amber-500/40 bg-amber-500/[0.08]' :
    'border-red-500/40 bg-red-500/[0.08]'

  return (
    <div className="space-y-5">

      {/* Camera */}
      <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl overflow-hidden">
        {/* Video */}
        <div className="relative w-full">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`w-full block ${scanning ? '' : 'hidden'}`}
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-52 h-52">
                <div className="absolute inset-0 border-2 border-swin-red/20 rounded" />
                <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-swin-red rounded-tl" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-swin-red rounded-tr" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-swin-red rounded-bl" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-swin-red rounded-br" />
                <div className="absolute left-0 right-0 h-0.5 bg-swin-red/60 animate-scan-line" />
              </div>
            </div>
          )}
          {!scanning && (
            <div className="flex items-center justify-center h-48 bg-white/[0.02]">
              <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Camera controls */}
        <div className="p-4 space-y-3">
          {cameraError && (
            <p className="text-red-400 text-[13px] leading-relaxed">{cameraError}</p>
          )}

          {scanning ? (
            <div className="flex gap-2">
              {result && (
                <button
                  onClick={scanNext}
                  className="flex-1 py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
                >
                  Scan next ticket
                </button>
              )}
              <button
                onClick={stopScanner}
                className={`py-3 border border-white/15 text-white/40 hover:text-white text-[13px] rounded-lg transition-colors ${result ? 'px-4' : 'flex-1'}`}
              >
                Stop camera
              </button>
            </div>
          ) : (
            <button
              onClick={startScanner}
              className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {cameraError ? 'Retry camera' : scanCount > 0 ? 'Start camera again' : 'Start camera'}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="border border-white/10 bg-white/[0.02] p-6 rounded-xl">
          <p className="text-white/40 text-[13px] animate-pulse">Checking ticket…</p>
        </div>
      )}

      {/* Result card */}
      {!loading && result && (
        <div className={`border rounded-xl overflow-hidden ${statusColour}`}>

          {/* Status header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            {result.status === 'success' && (
              <>
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-[16px]">Checked in</p>
                  <p className="text-emerald-400/50 text-[11px]">
                    {new Date(result.checkedInAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </>
            )}
            {result.status === 'already_used' && (
              <>
                <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-400 font-semibold text-[16px]">Already checked in</p>
                  <p className="text-amber-400/50 text-[11px]">
                    at {new Date(result.checkedInAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </>
            )}
            {result.status === 'not_found' && (
              <>
                <div className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-400 font-semibold text-[16px]">Ticket not found</p>
              </>
            )}
            {result.status === 'error' && (
              <>
                <div className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-400 font-semibold text-[16px]">{result.message}</p>
              </>
            )}
          </div>

          {/* Ticket details */}
          {(result.status === 'success' || result.status === 'already_used') && (
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-1">Guest</p>
                <p className="text-white text-[18px] font-medium">{result.name ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-1">Event</p>
                <p className="text-white/80 text-[14px]">{result.eventTitle}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-1">Tickets</p>
                <p className="text-white/80 text-[14px]">{result.quantity} {result.quantity === 1 ? 'ticket' : 'tickets'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
