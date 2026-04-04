import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await ensureUserRecord(data.user)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code — may be implicit flow with fragment tokens.
  // Redirect to a client-side handler that can read the fragment.
  const nextParam = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
  return NextResponse.redirect(`${origin}/auth/confirm${nextParam}`)
}

export async function ensureUserRecord(user: User) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!existing) {
    const email = user.email ?? ''
    const SUPER_ADMINS = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())

    const role = SUPER_ADMINS.includes(email.toLowerCase())
      ? 'super_admin'
      : email.endsWith('@swin.edu.au') || email.endsWith('@swinburne.edu.au')
      ? 'staff'
      : 'public'

    await supabase.from('users').insert({
      auth_id: user.id,
      email,
      full_name: user.user_metadata?.full_name ?? null,
      role,
    })
  }
}
