import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ensureUserRecord } from '@/lib/auth/ensure-user-record'

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

