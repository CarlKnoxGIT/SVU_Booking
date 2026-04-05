'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SwinburneLogo from '@/components/swinburne-logo'
import Link from 'next/link'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/staff')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center px-8 py-6 border-b border-white/[0.06]">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-light mb-1">Set your password</h1>
          <p className="text-white/35 text-[13px] mb-8">
            Choose a password to secure your SVU Booking account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={8}
                placeholder="At least 8 characters"
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Set password & continue'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
