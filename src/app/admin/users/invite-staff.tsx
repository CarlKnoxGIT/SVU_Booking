'use client'

import { useState, useTransition } from 'react'
import { inviteStaff } from './actions'

export function InviteStaff() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError(null)
    startTransition(async () => {
      try {
        await inviteStaff(email)
        setSent(true)
        setEmail('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invite')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setSent(false) }}
        placeholder="staff@swin.edu.au"
        required
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-swin-red"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-[12px] text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 whitespace-nowrap"
      >
        {isPending ? 'Sending…' : 'Send invite'}
      </button>
      {sent && <span className="text-[12px] text-emerald-400">Sent!</span>}
      {error && <span className="text-[12px] text-red-400">{error}</span>}
    </form>
  )
}
