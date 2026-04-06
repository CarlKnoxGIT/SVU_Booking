'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(formData: FormData) {
  const id = formData.get('id') as string
  const role = formData.get('role') as string
  const supabase = createAdminClient()
  await supabase.from('users').update({ role }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteUser(id: string) {
  const supabase = createAdminClient()

  // Get the auth_id so we can delete the auth user too
  const { data: profile, error: fetchErr } = await supabase
    .from('users')
    .select('auth_id')
    .eq('id', id)
    .single()

  if (fetchErr) console.error('[deleteUser] fetch profile error:', fetchErr)

  // Delete dependent records first
  await supabase.from('tickets').delete().eq('user_id', id)
  await supabase.from('payments').delete().eq('user_id', id)
  await supabase.from('bookings').delete().eq('user_id', id)

  // Delete from public users table
  const { error: deleteErr } = await supabase.from('users').delete().eq('id', id)
  if (deleteErr) console.error('[deleteUser] delete from users error:', deleteErr)

  // Delete from Supabase auth (requires service role)
  if (profile?.auth_id) {
    const { error: authErr } = await supabase.auth.admin.deleteUser(profile.auth_id)
    if (authErr) console.error('[deleteUser] auth delete error:', authErr)
  } else {
    console.log('[deleteUser] no auth_id found for user:', id)
  }

  revalidatePath('/admin')
}
