'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBookingRequest(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!profile || !['staff', 'super_admin'].includes(profile.role)) {
    return { error: 'Insufficient permissions' }
  }

  const title = (formData.get('title') as string)?.trim()
  const bookingType = formData.get('booking_type') as string
  const description = (formData.get('description') as string)?.trim()
  const startDate = formData.get('start_date') as string
  const startTime = formData.get('start_time') as string
  const durationMinutes = parseInt(formData.get('duration_minutes') as string, 10)
  const attendeeCount = parseInt(formData.get('attendee_count') as string, 10)

  if (!title || !bookingType || !startDate || !startTime) {
    return { error: 'Please fill in all required fields.' }
  }

  const startAt = new Date(`${startDate}T${startTime}:00`)
  const endAt = new Date(startAt.getTime() + durationMinutes * 60_000)

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: profile.id,
      title,
      booking_type: bookingType,
      description: description || null,
      start_time: startAt.toISOString(),
      end_time: endAt.toISOString(),
      attendee_count: isNaN(attendeeCount) ? null : attendeeCount,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  redirect(`/staff/book/confirm?id=${booking.id}`)
}
