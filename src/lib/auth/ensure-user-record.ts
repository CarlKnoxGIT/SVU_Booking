'use server'

import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

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
