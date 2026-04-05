'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminWeekBookings(weekStart: string) {
  const supabase = createAdminClient()
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const { data, error } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, end_time, booking_type, attendee_count, description, user_id, users!bookings_user_id_fkey(full_name, email)')
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', start.toISOString())
    .lt('start_time', end.toISOString())
    .order('start_time')

  if (error) console.error('[getAdminWeekBookings]', error)
  return data ?? []
}

export async function approveBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'confirmed', approved_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin')
}

export async function rejectBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = createAdminClient()
  await supabase.from('bookings').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function approveBookingById(id: string) {
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'confirmed', approved_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin')
}

export async function rejectBookingById(id: string) {
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin')
}
