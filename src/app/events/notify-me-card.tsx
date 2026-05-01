'use client'

import { useActionState } from 'react'
import { submitEventNotifySignup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string; success?: boolean } | null

export function NotifyMeCard() {
  const [state, formAction, pending] = useActionState(
    submitEventNotifySignup as (state: State, formData: FormData) => Promise<State>,
    null
  )

  if (state?.success) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/[0.14] via-sky-500/[0.05] to-transparent p-8 text-center">
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="relative">
          <div className="mb-3 text-4xl text-sky-300">✦</div>
          <h2 className="text-[22px] font-semibold text-white mb-1">You&rsquo;re on the list</h2>
          <p className="text-[13px] text-white/60 leading-relaxed">
            We&rsquo;ll email you when new SVU events are announced.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/[0.14] via-sky-500/[0.05] to-white/[0.01] p-7 shadow-[0_0_40px_-12px_rgba(56,189,248,0.3)]">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
          </span>
          <p className="text-[11px] font-bold tracking-[0.2em] text-sky-300 uppercase">Coming next</p>
        </div>

        <h2 className="text-[26px] font-semibold text-white leading-tight tracking-tight">
          More sessions <span className="text-sky-300">coming soon</span>
        </h2>
        <p className="mt-3 text-[15px] text-white/75 leading-relaxed max-w-prose">
          Be the first to know. Drop your name and email and we&rsquo;ll let you know the moment SVU events go live — one email, no spam, ever.
        </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notify_name" className="text-[12px] text-white/50 uppercase tracking-wide">
              Name
            </Label>
            <Input
              id="notify_name"
              name="name"
              type="text"
              required
              maxLength={200}
              placeholder="Jane Smith"
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-sky-400 rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notify_email" className="text-[12px] text-white/50 uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="notify_email"
              name="email"
              type="email"
              required
              placeholder="jane@example.com"
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-sky-400 rounded-none"
            />
          </div>
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="notify_website">Website (leave blank)</label>
          <input
            id="notify_website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white rounded-none px-6 py-2.5 text-[13px] font-semibold transition-colors"
        >
          {pending ? 'Adding…' : 'Notify me'}
        </Button>
      </form>
      </div>
    </div>
  )
}
