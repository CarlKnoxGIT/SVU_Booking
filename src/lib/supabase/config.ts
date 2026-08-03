export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim()

  if (!url || !publishableKey) {
    const missing: string[] = []

    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!publishableKey) {
      missing.push(
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)'
      )
    }

    throw new Error(
      `Supabase is not configured. Missing ${missing.join(' and ')}. `
      + 'Add the values to .env.local, then restart the Next.js development server.'
    )
  }

  return { url, publishableKey }
}
