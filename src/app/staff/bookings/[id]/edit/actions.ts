'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateBooking(bookingId: string, _prevState: unknown, formData: FormData): Promise<{ error?: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  if (!profile) return { error: 'Profile not found' }

  const title = (formData.get('title') as string)?.trim()
  const bookingType = formData.get('booking_type') as string
  const description = (formData.get('description') as string)?.trim()
  const startDate = formData.get('start_date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const attendeeCount = parseInt(formData.get('attendee_count') as string, 10)

  if (!title || !bookingType || !startDate || !startTime || !endTime) {
    return { error: 'Please fill in all required fields.' }
  }

  const startAt = new Date(`${startDate}T${startTime}:00`)
  const endAt = new Date(`${startDate}T${endTime}:00`)

  if (endAt <= startAt) return { error: 'End time must be after start time.' }

  // Get facility id
  const { data: facility } = await supabase
    .from('facilities')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!facility) return { error: 'Facility not found.' }

  // Conflict check (exclude this booking)
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('facility_id', facility.id)
    .eq('status', 'confirmed')
    .neq('id', bookingId)
    .lt('start_time', endAt.toISOString())
    .gt('end_time', startAt.toISOString())

  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot conflicts with an existing confirmed booking.' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      title,
      booking_type: bookingType,
      description: description || null,
      start_time: startAt.toISOString(),
      end_time: endAt.toISOString(),
      attendee_count: isNaN(attendeeCount) ? null : attendeeCount,
    })
    .eq('id', bookingId)
    .eq('user_id', profile.id)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  redirect('/staff')
}
