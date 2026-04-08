'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const full_name = (formData.get('full_name') as string)?.trim()
  const organisation = (formData.get('organisation') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()

  if (!full_name) return { error: 'Name is required.' }

  const { error } = await supabase
    .from('users')
    .update({
      full_name,
      organisation: organisation || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/staff')
  return { success: true }
}

export async function changePassword(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { success: true }
}
