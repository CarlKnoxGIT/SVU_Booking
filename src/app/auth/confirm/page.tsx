'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const next = searchParams.get('next') ?? '/'

    // Parse tokens from the URL fragment (#access_token=...&refresh_token=...)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(async ({ data: { session }, error }) => {
          if (error || !session) {
            router.replace('/login?error=auth_callback_failed')
            return
          }
          await ensureUserRecord(supabase, session.user)
          router.replace(next)
        })
    } else {
      // Fallback: maybe session already exists
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace(next)
        } else {
          router.replace('/login?error=auth_callback_failed')
        }
      })
    }
  }, [router, searchParams])

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <p className="text-zinc-400 text-sm animate-pulse">Signing you in…</p>
    </main>
  )
}

async function ensureUserRecord(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!existing) {
    const email = user.email ?? ''
    const superAdmins = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())

    const role = superAdmins.includes(email.toLowerCase())
      ? 'super_admin'
      : email.endsWith('@swin.edu.au') || email.endsWith('@swinburne.edu.au')
      ? 'staff'
      : 'public'

    await supabase.from('users').insert({
      auth_id: user.id,
      email,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      role,
    })
  }
}
