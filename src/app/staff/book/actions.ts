'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBookingRequest(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  // Get the SVU facility ID
  const { data: facility } = await supabase
    .from('facilities')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!facility) return { error: 'Facility not found.' }

  const startAt = new Date(`${startDate}T${startTime}:00`)
  const endAt = new Date(startAt.getTime() + durationMinutes * 60_000)

  // Basic conflict check
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('facility_id', facility.id)
    .eq('status', 'confirmed')
    .lt('start_time', endAt.toISOString())
    .gt('end_time', startAt.toISOString())

  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot conflicts with an existing confirmed booking. Please choose a different time.' }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: profile.id,
      facility_id: facility.id,
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
