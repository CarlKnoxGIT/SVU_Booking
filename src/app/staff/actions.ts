'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!profile) return

  // Only allow cancelling own bookings
  await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('user_id', profile.id)
    .in('status', ['pending', 'confirmed'])

  revalidatePath('/staff')
}

export async function cancelSeries(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!profile) return

  const now = new Date().toISOString()

  // Cancel all future bookings in this series owned by the current user
  await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: now })
    .eq('series_id', seriesId)
    .eq('user_id', profile.id)
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', now)

  // Mark the series as cancelled
  await supabase
    .from('recurring_series')
    .update({ status: 'cancelled' })
    .eq('id', seriesId)
    .eq('user_id', profile.id)

  revalidatePath('/staff')
}
