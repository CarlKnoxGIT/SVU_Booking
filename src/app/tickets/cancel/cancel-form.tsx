'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CancelForm({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [refunded, setRefunded] = useState(false)

  async function handleCancel() {
    setState('loading')
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    try {
      const res = await fetch(`${base}/api/tickets/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setState('error')
      } else {
        setRefunded(data.refunded ?? false)
        setState('done')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="text-center">
        <p className="text-white text-lg font-light mb-2">Tickets cancelled.</p>
        <p className="text-white/50 text-sm mb-6">
          {refunded
            ? 'Your refund has been processed and will appear within 5–10 business days.'
            : 'Your tickets have been cancelled.'}
        </p>
        <Link href="/events" className="text-sm text-white/40 hover:text-white/70 underline transition-colors">
          Browse other events
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm text-red-300">
        {errorMsg}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCancel}
        disabled={state === 'loading'}
        className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-colors"
      >
        {state === 'loading' ? 'Cancelling…' : 'Yes, cancel my tickets'}
      </button>
      <Link
        href="/events"
        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/50 hover:text-white/80 hover:border-white/20 transition-colors text-center"
      >
        Keep my tickets
      </Link>
    </div>
  )
}
