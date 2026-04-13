'use client'

import { useActionState } from 'react'
import { signInWithPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string } | null

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInWithPassword as (state: State, formData: FormData) => Promise<State>,
    null
  )

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@swin.edu.au"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-swin-red"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-swin-red"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-swin-red hover:bg-swin-red-hover text-white"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

    </div>
  )
}
