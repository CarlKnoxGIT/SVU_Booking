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
  await supabase.from('users').delete().eq('id', id)
  revalidatePath('/admin')
}
