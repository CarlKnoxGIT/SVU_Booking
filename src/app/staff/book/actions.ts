'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

export async function getWeekBookings(weekStart: string) {
  const supabase = createAdminClient()
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  const [bookingsRes, eventsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, title, status, start_time, end_time, booking_type, user_id, description, attendee_count, series_id, users!bookings_user_id_fkey(full_name)')
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', start.toISOString())
      .lt('start_time', end.toISOString())
      .order('start_time'),
    supabase
      .from('events')
      .select('id, title, description, event_date, start_time, end_time')
      .eq('is_published', true)
      .gte('event_date', startDate)
      .lt('event_date', endDate),
  ])

  if (bookingsRes.error) console.error('[getWeekBookings] error:', bookingsRes.error)

  const bookings = (bookingsRes.data ?? []).map(b => ({ ...b, source: 'booking' as const }))

  const events = (eventsRes.data ?? []).map(e => ({
    id: `event_${e.id}`,
    title: e.title,
    status: 'confirmed' as const,
    start_time: `${e.event_date}T${e.start_time}`,
    end_time: `${e.event_date}T${e.end_time}`,
    booking_type: 'public_event',
    user_id: null as unknown as string,
    description: e.description ?? null,
    attendee_count: null,
    series_id: null,
    users: null,
    source: 'event' as const,
  }))

  return [...bookings, ...events]
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

  // Handle recurring bookings
  const isRecurring = formData.get('is_recurring') === '1' && bookingType === 'academic'
  const recurrencePattern = (formData.get('recurrence_pattern') as string) || 'weekly'
  const seriesEndStr = formData.get('series_end') as string
  const durationMinutes = parseInt(durationValue, 10)

  let seriesId: string | null = null

  if (isRecurring && seriesEndStr) {
    const seriesEnd = new Date(seriesEndStr)
    if (seriesEnd <= startAt) return { error: 'Series end date must be after the first session.' }

    // Create recurring_series record using admin client (bypasses RLS insert restriction)
    const adminSupabase = createAdminClient()
    const { data: series, error: seriesErr } = await adminSupabase
      .from('recurring_series')
      .insert({
        user_id: profile.id,
        facility_id: facility.id,
        pattern: recurrencePattern,
        day_of_week: startAt.getDay(),
        start_time: startTime,
        duration_mins: durationMinutes,
        series_start: startDate,
        series_end: seriesEndStr,
        status: 'active',
      })
      .select('id')
      .single()

    if (seriesErr) return { error: seriesErr.message }
    seriesId = series.id

    // Generate all session dates
    const intervalDays = recurrencePattern === 'biweekly' ? 14 : 7
    const sessionDates: Date[] = []
    let cursor = new Date(startAt)
    while (cursor <= seriesEnd) {
      sessionDates.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + intervalDays)
    }

    // Bulk insert all bookings
    const bookingRows = sessionDates.map(d => {
      const sessionEnd = new Date(d.getTime() + durationMinutes * 60_000)
      return {
        user_id: profile.id,
        facility_id: facility.id,
        title,
        booking_type: bookingType,
        description: description || null,
        start_time: d.toISOString(),
        end_time: sessionEnd.toISOString(),
        attendee_count: isNaN(attendeeCount) ? null : attendeeCount,
        status: 'pending',
        series_id: seriesId,
      }
    })

    const { data: insertedBookings, error: bulkErr } = await adminSupabase
      .from('bookings')
      .insert(bookingRows)
      .select('id')

    if (bulkErr) return { error: bulkErr.message }

    // Notify staff
    const { data: userRecord } = await supabase.from('users').select('email, full_name').eq('id', profile.id).single()
    if (userRecord?.email) {
      const dateStr = startAt.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const timeStr = startAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
      const endDateStr = new Date(seriesEndStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
      resend.emails.send({
        from: FROM_ADDRESS,
        to: userRecord.email,
        replyTo: 'cknox@swin.edu.au',
        subject: `Recurring booking request received — ${title}`,
        html: `
          <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SVU Booking</p>
            <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">Recurring request received.</h2>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Booking</p>
              <p style="margin:0 0 16px;font-size:16px;color:#fff;">${title}</p>
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Schedule</p>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${recurrencePattern === 'biweekly' ? 'Every 2 weeks' : 'Weekly'} from ${dateStr} · ${timeStr}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">${sessionDates.length} sessions until ${endDateStr}</p>
            </div>
            <p style="font-size:13px;color:rgba(255,255,255,0.5);">Your request is pending admin approval. You'll receive another email once it's reviewed.</p>
          </div>`,
      }).catch(err => console.error('[booking request email]', err))
    }

    return { success: true, bookingId: insertedBookings?.[0]?.id ?? '' }
  }

  // Single booking
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

  // Notify staff their request was received
  const { data: userRecord } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', profile.id)
    .single()

  if (userRecord?.email) {
    const dateStr = startAt.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeStr = startAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
    resend.emails.send({
      from: FROM_ADDRESS,
      to: userRecord.email,
      replyTo: 'cknox@swin.edu.au',
      subject: `Booking request received — ${title}`,
      html: `
        <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SVU Booking</p>
          <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">Request received.</h2>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Booking</p>
            <p style="margin:0 0 16px;font-size:16px;color:#fff;">${title}</p>
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Date &amp; Time</p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${dateStr} · ${timeStr}</p>
          </div>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);">Your request is pending admin approval. You'll receive another email once it's reviewed.</p>
        </div>`,
    }).catch(err => console.error('[booking request email]', err))
  }

  return { success: true, bookingId: booking.id }
}
