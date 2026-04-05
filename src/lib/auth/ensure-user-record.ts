'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function ensureUserRecord(user: User) {
  const supabase = createAdminClient()
  const email = user.email ?? ''

  // 1. Already linked by auth_id
  const { data: byAuthId } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (byAuthId) return

  // 2. Pre-created by admin approval (has email, no auth_id yet) — link it
  const { data: byEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .is('auth_id', null)
    .single()

  if (byEmail) {
    await supabase
      .from('users')
      .update({
        auth_id: user.id,
        full_name: user.user_metadata?.full_name ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', byEmail.id)
    return
  }

  // 3. New user — assign role based on email
  const SUPER_ADMINS = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())

  const role = SUPER_ADMINS.includes(email.toLowerCase()) ? 'super_admin' : 'public'

  await supabase.from('users').insert({
    auth_id: user.id,
    email,
    full_name: user.user_metadata?.full_name ?? null,
    role,
  })
}
