'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { checkInTicket, type CheckInResult, type Tally } from './actions'

const SCAN_INTERVAL_MS = 200

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
      // fall through to jsqr
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

function TallyCard({ tally }: { tally: Tally }) {
  const pct = tally.sold > 0 ? Math.round((tally.checkedIn / tally.sold) * 100) : 0
  return (
    <div className="border border-white/[0.07] bg-white/[0.02] rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.16em] text-white/25 uppercase mb-4">Check-in tally · {tally.eventTitle}</p>
      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-[36px] font-semibold text-white leading-none">{tally.checkedIn}</p>
          <p className="text-[12px] text-white/40 mt-1">checked in</p>
        </div>
        <div className="w-px bg-white/[0.06]" />
        <div>
          <p className="text-[36px] font-semibold text-white/40 leading-none">{tally.sold}</p>
          <p className="text-[12px] text-white/25 mt-1">tickets sold</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-white/25 mt-2">{pct}% checked in</p>
    </div>
  )
}

function formatSessionTime(eventDate: string, startTime: string, endTime: string): string {
  if (!eventDate || !startTime) return ''
  const date = new Date(eventDate + 'T12:00:00')
  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const start = startTime.slice(0, 5)
  const end = endTime ? endTime.slice(0, 5) : ''
  return end ? `${dateStr}, ${start} – ${end}` : `${dateStr}, ${start}`
}

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const processingRef = useRef(false)
  const lastScanRef = useRef(0)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [tally, setTally] = useState<Tally | null>(null)

  function stopScanner() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }

  const handleCode = useCallback(async (code: string) => {
    if (processingRef.current) return
    processingRef.current = true

    // Stop camera immediately so the result screen can take over
    stopScanner()
    setLoading(true)
    setResult(null)

    const res = await checkInTicket(code)
    setResult(res)
    if ((res.status === 'success' || res.status === 'already_used') && res.tally) {
      setTally(res.tally)
    }
    setLoading(false)
    processingRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const now = Date.now()
    if (now - lastScanRef.current >= SCAN_INTERVAL_MS && !processingRef.current) {
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
    processingRef.current = false
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

  useEffect(() => () => stopScanner(), [])

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-swin-red animate-spin" />
        <p className="text-white/40 text-[14px]">Checking ticket…</p>
      </div>
    )
  }

  // ── Result state ───────────────────────────────────────────────
  if (result) {
    const isSuccess = result.status === 'success'
    const isAlreadyUsed = result.status === 'already_used'
    const isError = result.status === 'not_found' || result.status === 'error'

    return (
      <div className="space-y-5">
        {/* Status banner */}
        <div className={`rounded-2xl p-6 text-center ${
          isSuccess ? 'bg-emerald-500/10 border border-emerald-500/30' :
          isAlreadyUsed ? 'bg-amber-500/10 border border-amber-500/30' :
          'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className={`mx-auto mb-3 h-14 w-14 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-emerald-500/20' :
            isAlreadyUsed ? 'bg-amber-500/20' :
            'bg-red-500/20'
          }`}>
            {isSuccess && (
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {isAlreadyUsed && (
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            )}
            {isError && (
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <p className={`text-[22px] font-semibold ${
            isSuccess ? 'text-emerald-400' :
            isAlreadyUsed ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {isSuccess && 'Checked in'}
            {isAlreadyUsed && 'Already checked in'}
            {result.status === 'not_found' && 'Ticket not found'}
            {result.status === 'error' && result.message}
          </p>

          {isAlreadyUsed && (
            <p className="text-amber-400/60 text-[13px] mt-1">
              Scanned at {new Date(result.checkedInAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
          )}
        </div>

        {/* Ticket details */}
        {(isSuccess || isAlreadyUsed) && (
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold tracking-[0.16em] text-white/25 uppercase mb-1">Guest</p>
              <p className="text-white text-[20px] font-medium">{result.name ?? 'Unknown'}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold tracking-[0.16em] text-white/25 uppercase mb-1">Tickets</p>
              <p className="text-white text-[18px] font-medium">{result.quantity} {result.quantity === 1 ? 'ticket' : 'tickets'}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold tracking-[0.16em] text-white/25 uppercase mb-1">Event</p>
              <p className="text-white text-[15px] font-medium">{result.eventTitle}</p>
              {result.eventDate && (
                <p className="text-white/40 text-[13px] mt-0.5">
                  {formatSessionTime(result.eventDate, result.startTime, result.endTime)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Scan again */}
        <button
          onClick={startScanner}
          className="w-full py-4 bg-swin-red hover:bg-swin-red-hover text-white text-[15px] font-semibold rounded-xl transition-colors"
        >
          Scan next ticket
        </button>

        {tally && <TallyCard tally={tally} />}
      </div>
    )
  }

  // ── Camera / idle state ────────────────────────────────────────
  return (
    <div className="space-y-5">
      {tally && <TallyCard tally={tally} />}
      <div className="border border-white/[0.07] bg-white/[0.02] rounded-2xl overflow-hidden">
        {/* Viewfinder */}
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
            <div className="flex items-center justify-center h-52 bg-white/[0.02]">
              <svg className="w-14 h-14 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 17.25h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75z" />
              </svg>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="p-4 space-y-3">
          {cameraError && (
            <p className="text-red-400 text-[13px] leading-relaxed">{cameraError}</p>
          )}
          {scanning ? (
            <div className="text-center">
              <p className="text-white/30 text-[13px] mb-3">Point camera at a ticket QR code</p>
              <button
                onClick={stopScanner}
                className="px-6 py-2.5 border border-white/15 text-white/40 hover:text-white text-[13px] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startScanner}
              className="w-full py-4 bg-swin-red hover:bg-swin-red-hover text-white text-[15px] font-semibold rounded-xl transition-colors"
            >
              Start scanning
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
