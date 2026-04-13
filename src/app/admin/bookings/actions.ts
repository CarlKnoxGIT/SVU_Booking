'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

async function getBookingWithUser(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('bookings')
    .select('title, start_time, end_time, users!bookings_user_id_fkey(full_name, email)')
    .eq('id', id)
    .single()
  return data
}

async function sendBookingEmail(id: string, approved: boolean) {
  const booking = await getBookingWithUser(id)
  if (!booking) return
  const user = Array.isArray(booking.users) ? booking.users[0] : booking.users
  if (!user?.email) return

  const start = new Date(booking.start_time)
  const dateStr = start.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = start.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })

  const textBody = [
    approved ? 'Your booking is confirmed.' : 'Your booking was declined.',
    '',
    `Booking:    ${booking.title}`,
    `Date & Time: ${dateStr} · ${timeStr}`,
    '',
    approved
      ? 'Your booking is confirmed. See you at the SVU.'
      : 'Your booking request was not approved. Reply to this email if you have questions.',
  ].join('\n')

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    replyTo: 'cknox@swin.edu.au',
    subject: approved
      ? `Booking confirmed — ${booking.title}`
      : `Booking declined — ${booking.title}`,
    text: textBody,
    tags: [{ name: 'type', value: approved ? 'booking-confirmed' : 'booking-declined' }],
    html: `
      <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">
          SVU Booking
        </p>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">
          ${approved ? 'Your booking is confirmed.' : 'Your booking was declined.'}
        </h2>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Booking</p>
          <p style="margin:0 0 16px;font-size:16px;color:#fff;">${booking.title}</p>
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Date &amp; Time</p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${dateStr} · ${timeStr}</p>
        </div>
        ${approved
          ? '<p style="font-size:13px;color:rgba(255,255,255,0.5);">Your booking is confirmed. See you at the SVU.</p>'
          : '<p style="font-size:13px;color:rgba(255,255,255,0.5);">Your booking request was not approved. Reply to this email if you have questions.</p>'
        }
      </div>`,
  }).catch(err => console.error('[booking email]', err))
}

export async function getAdminWeekBookings(weekStart: string) {
  const supabase = createAdminClient()
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  const [bookingsRes, eventsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, title, status, start_time, end_time, booking_type, attendee_count, description, user_id, users!bookings_user_id_fkey(full_name, email)')
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

  if (bookingsRes.error) console.error('[getAdminWeekBookings]', bookingsRes.error)

  const bookings = (bookingsRes.data ?? []).map(b => ({ ...b, source: 'booking' as const }))

  const events = (eventsRes.data ?? []).map(e => ({
    id: `event_${e.id}`,
    title: e.title,
    status: 'confirmed' as const,
    start_time: `${e.event_date}T${e.start_time}`,
    end_time: `${e.event_date}T${e.end_time}`,
    booking_type: 'public_event',
    attendee_count: null,
    description: e.description ?? null,
    user_id: null as unknown as string,
    users: null,
    source: 'event' as const,
  }))

  return [...bookings, ...events]
}

export async function bulkDeleteBookings(ids: string[]) {
  const supabase = createAdminClient()
  await supabase.from('bookings').delete().in('id', ids)
  revalidatePath('/admin')
}

export async function bulkApproveBookings(ids: string[]) {
  const supabase = createAdminClient()
  await supabase
    .from('bookings')
    .update({ status: 'confirmed', approved_at: new Date().toISOString() })
    .in('id', ids)
  // Send confirmation emails
  await Promise.all(ids.map(id => sendBookingEmail(id, true).catch(() => {})))
  revalidatePath('/admin')
}

export async function blockDates(fields: {
  reason: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
}) {
  const supabase = createAdminClient()
  const { data: facility } = await supabase.from('facilities').select('id').eq('is_active', true).single()
  if (!facility) throw new Error('Facility not found')

  // Get the admin user to assign bookings to
  const { data: admin } = await supabase.from('users').select('id').eq('role', 'super_admin').limit(1).single()
  if (!admin) throw new Error('No admin user found')

  // Create one booking per day in the range
  const start = new Date(fields.start_date)
  const end = new Date(fields.end_date)
  const rows = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const dateStr = cursor.toISOString().split('T')[0]
    rows.push({
      user_id: admin.id,
      facility_id: facility.id,
      title: fields.reason,
      booking_type: 'maintenance',
      status: 'confirmed',
      start_time: new Date(`${dateStr}T${fields.start_time}:00`).toISOString(),
      end_time: new Date(`${dateStr}T${fields.end_time}:00`).toISOString(),
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const { error } = await supabase.from('bookings').insert(rows)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function adminCreateBooking(fields: {
  title: string
  booking_type: string
  description: string | null
  start_time: string
  end_time: string
  attendee_count: number | null
  status: string
}) {
  const supabase = createAdminClient()

  const { data: facility } = await supabase
    .from('facilities')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!facility) throw new Error('Facility not found')

  const { error } = await supabase.from('bookings').insert({
    ...fields,
    facility_id: facility.id,
    user_id: (await supabase.from('users').select('id').eq('role', 'super_admin').limit(1).single()).data?.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function adminUpdateAllByTitle(
  originalTitle: string,
  fields: { title: string; booking_type: string; status: string; start_time_of_day: string; end_time_of_day: string }
) {
  const supabase = createAdminClient()
  // Fetch all bookings with this title
  const { data: matches } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('title', originalTitle)

  if (!matches || matches.length === 0) return

  // Update each one preserving its date but using new times
  await Promise.all(matches.map(b => {
    const date = b.start_time.slice(0, 10)
    const newStart = new Date(`${date}T${fields.start_time_of_day}:00`)
    const newEnd = new Date(`${date}T${fields.end_time_of_day}:00`)
    return supabase.from('bookings').update({
      title: fields.title,
      booking_type: fields.booking_type,
      status: fields.status,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
    }).eq('id', b.id)
  }))

  revalidatePath('/admin')
}

export async function adminUpdateBooking(
  id: string,
  fields: {
    title: string
    booking_type: string
    description: string | null
    start_time: string
    end_time: string
    attendee_count: number | null
    status: string
  }
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('bookings')
    .update(fields)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
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
  await sendBookingEmail(id, true)
  revalidatePath('/admin')
}

export async function rejectBookingById(id: string) {
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
  await sendBookingEmail(id, false)
  revalidatePath('/admin')
}
