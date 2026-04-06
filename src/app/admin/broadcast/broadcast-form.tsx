'use client'

import { useState, useTransition } from 'react'
import { broadcastMessage } from './actions'

export function BroadcastForm() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ sent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await broadcastMessage({ from, to, subject, message })
        setResult(res)
        setMessage('')
        setSubject('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send')
      }
    })
  }

  const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-swin-red [color-scheme:dark]'
  const labelCls = 'block text-[11px] font-bold tracking-[0.12em] text-white/25 uppercase mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Bookings from</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Bookings until</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} required className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. SVU closure notice" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} placeholder="Your message to all staff with confirmed bookings in that period…" className={`${inputCls} resize-none`} />
      </div>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
      {result && (
        <p className="text-[12px] text-emerald-400">
          Sent to {result.sent} booking{result.sent !== 1 ? 's' : ''}.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-lg bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Send broadcast'}
      </button>
    </form>
  )
}
