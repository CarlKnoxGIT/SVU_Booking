'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { checkInTicket, type CheckInResult } from './actions'

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const cooldownRef = useRef(false)

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

  const tick = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const jsQR = (await import('jsqr')).default
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code?.data && !cooldownRef.current) {
      await handleCode(code.data)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [handleCode])

  async function startScanner() {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setCameraError('Camera access denied or unavailable.')
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
      <div className="border border-white/[0.07] bg-white/[0.02] p-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-4">Camera scan</p>

        <div className="relative mb-4">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`w-full max-w-sm mx-auto rounded block ${scanning ? '' : 'hidden'}`}
          />
          {/* Scanning overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-swin-red/60 rounded">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-swin-red rounded-tl" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-swin-red rounded-tr" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-swin-red rounded-bl" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-swin-red rounded-br" />
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {cameraError && <p className="text-red-400 text-[13px] mb-3">{cameraError}</p>}

        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold transition-colors"
          >
            Start camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full py-2.5 border border-white/15 text-white/50 hover:text-white text-[13px] transition-colors"
          >
            Stop camera
          </button>
        )}
      </div>


      {/* Result */}
      {(result || loading) && (
        <div className={`border p-6 transition-all ${
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
              <p className="text-white/30 text-[12px]">Checked in at {new Date(result.checkedInAt).toLocaleTimeString('en-AU')}</p>
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
