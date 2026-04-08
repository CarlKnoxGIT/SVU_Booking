'use client'

import { useActionState } from 'react'
import { submitStaffRequest } from './actions'
import Link from 'next/link'
import SwinburneLogo from '@/components/swinburne-logo'

export default function StaffRegisterPage() {
  const [state, formAction, pending] = useActionState(submitStaffRequest, null)

  if (state?.success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto mb-6 h-14 w-14 flex items-center justify-center border border-swin-red/30 bg-swin-red/10">
            <svg className="h-7 w-7 text-swin-red-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-light mb-3">Request submitted</h1>
          <p className="text-white/40 text-[14px] leading-relaxed">
            Your request is pending review. You'll receive an email at your Swinburne address once approved.
          </p>
          <Link href="/" className="mt-8 inline-block text-[12px] text-white/25 hover:text-white/50 transition-colors">
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
        <Link href="/">
          <SwinburneLogo className="h-8 w-auto" />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-light mb-1">Request staff access</h1>
          <p className="text-white/35 text-[13px] mb-8">
            Use your Swinburne account. Access is approved by the SVU team.
          </p>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Full name</label>
              <input
                name="full_name" required
                placeholder="e.g. Jane Smith"
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">Swinburne email</label>
              <input
                name="email" type="email" required
                placeholder="you@swin.edu.au"
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">
                Reason for access <span className="normal-case font-normal text-white/20">(optional)</span>
              </label>
              <textarea
                name="message" rows={3}
                placeholder="e.g. Academic staff, COS unit coordinator…"
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded resize-none"
              />
            </div>

            {state?.error && (
              <p className="text-[12px] text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-2 rounded">
                {state.error}
              </p>
            )}

            <button
              type="submit" disabled={pending}
              className="w-full py-3 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50 mt-2"
            >
              {pending ? 'Submitting…' : 'Submit request'}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-white/25">
            Already have access?{' '}
            <Link href="/login" className="text-white/50 hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
