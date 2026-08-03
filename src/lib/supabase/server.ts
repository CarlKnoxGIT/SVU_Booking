import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublicConfig } from './config'

export async function createClient() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getSupabasePublicConfig()

  return createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies set in middleware instead
          }
        },
      },
    }
  )
}

/** Service-role client — bypasses RLS. Server-side only. */
export function createAdminClient() {
  const { url } = getSupabasePublicConfig()
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim()

  if (!secretKey) {
    throw new Error(
      'Supabase admin access is not configured. Missing SUPABASE_SECRET_KEY '
      + '(or legacy SUPABASE_SERVICE_ROLE_KEY). Add it to .env.local, then restart '
      + 'the Next.js development server.'
    )
  }

  return createServerClient(
    url,
    secretKey,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
