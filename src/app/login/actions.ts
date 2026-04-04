'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureUserRecord } from '@/app/auth/callback/route'

export async function signInWithPassword(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid')) {
      return { error: 'Incorrect email or password.' }
    }
    return { error: error.message }
  }

  if (data.user) await ensureUserRecord(data.user)

  redirect('/admin')
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error || !data.url) redirect('/login?error=oauth_failed')
  redirect(data.url)
}
