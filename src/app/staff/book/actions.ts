'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function getWeekBookings(weekStart: string) {
  const supabase = createAdminClient()
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const { data, error } = await supabase
    .from('bookings')
    .select('id, title, status, start_time, end_time, booking_type, user_id, users!bookings_user_id_fkey(full_name)')
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', start.toISOString())
    .lt('start_time', end.toISOString())
    .order('start_time')

  if (error) console.error('[getWeekBookings] error:', error)
  console.log('[getWeekBookings] start:', start.toISOString(), 'rows:', data?.length ?? 0, data)
  return data ?? []
}

export async function createBookingRequest(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean; bookingId?: string } | null> {
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
  const durationValue = formData.get('duration_minutes') as string
  const attendeeCount = parseInt(formData.get('attendee_count') as string, 10)

  const isAllDay = durationValue === 'allday'
  const isCustom = durationValue === 'custom'

  const startTime = isAllDay ? '08:00' : (formData.get('start_time') as string)
  const endTime = isCustom ? (formData.get('end_time') as string) : null

  if (!title || !bookingType || !startDate || !startTime) {
    return { error: 'Please fill in all required fields.' }
  }
  if (isCustom && !endTime) {
    return { error: 'Please specify an end time.' }
  }

  // Get the SVU facility ID
  const { data: facility } = await supabase
    .from('facilities')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!facility) return { error: 'Facility not found.' }

  const startAt = new Date(`${startDate}T${startTime}:00`)
  let endAt: Date
  if (isAllDay) {
    endAt = new Date(`${startDate}T20:00:00`)
  } else if (isCustom && endTime) {
    endAt = new Date(`${startDate}T${endTime}:00`)
    if (endAt <= startAt) return { error: 'End time must be after start time.' }
  } else {
    const durationMinutes = parseInt(durationValue, 10)
    endAt = new Date(startAt.getTime() + durationMinutes * 60_000)
  }

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

  return { success: true, bookingId: booking.id }
}
