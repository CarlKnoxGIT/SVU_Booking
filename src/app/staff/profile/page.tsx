'use client'

import { useActionState } from 'react'
import { updateProfile, changePassword } from './actions'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type Profile = {
  full_name: string | null
  email: string | null
  organisation: string | null
  phone: string | null
  role: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('users')
        .select('full_name, email, organisation, phone, role')
        .eq('auth_id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-white/20 text-sm animate-pulse">Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-lg space-y-10">
      <div>
        <h1 className="text-2xl font-light text-white mb-1">Profile</h1>
        <p className="text-white/30 text-[13px]">Update your details and password.</p>
      </div>

      <ProfileForm profile={profile} />
      <PasswordForm />
    </div>
  )
}

function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, null)

  return (
    <section>
      <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-5">Details</p>
      <form action={formAction} className="space-y-4">
        <Field label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} required />
        <Field label="Email" name="email" defaultValue={profile.email ?? ''} disabled
          hint="Contact an admin to change your email." />
        <Field label="Organisation" name="organisation" defaultValue={profile.organisation ?? ''} />
        <Field label="Phone" name="phone" type="tel" defaultValue={profile.phone ?? ''} />

        {state?.error && <ErrorMsg>{state.error}</ErrorMsg>}
        {state?.success && <p className="text-[12px] text-emerald-400">Saved.</p>}

        <button
          type="submit" disabled={pending}
          className="px-5 py-2.5 bg-swin-red hover:bg-swin-red-hover text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  )
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null)

  return (
    <section className="border-t border-white/[0.06] pt-8">
      <p className="text-[11px] font-bold tracking-[0.14em] text-white/25 uppercase mb-5">Change password</p>
      <form action={formAction} className="space-y-4">
        <Field label="New password" name="password" type="password" placeholder="At least 8 characters" />
        <Field label="Confirm password" name="confirm" type="password" placeholder="Repeat password" />

        {state?.error && <ErrorMsg>{state.error}</ErrorMsg>}
        {state?.success && <p className="text-[12px] text-emerald-400">Password updated.</p>}

        <button
          type="submit" disabled={pending}
          className="px-5 py-2.5 bg-white/[0.06] border border-white/10 hover:bg-white/10 text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50"
        >
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  )
}

function Field({
  label, name, type = 'text', defaultValue, placeholder, disabled, hint, required,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  hint?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold tracking-[0.14em] text-white/30 uppercase">{label}</label>
      <input
        name={name} type={type} defaultValue={defaultValue} placeholder={placeholder}
        disabled={disabled} required={required}
        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 rounded disabled:opacity-40 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-[11px] text-white/20">{hint}</p>}
    </div>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-2 rounded">
      {children}
    </p>
  )
}
