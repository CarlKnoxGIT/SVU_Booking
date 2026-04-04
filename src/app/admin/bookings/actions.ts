'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)
  revalidatePath('/admin/bookings')
}

export async function rejectBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
  revalidatePath('/admin/bookings')
}
