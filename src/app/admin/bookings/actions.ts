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

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    replyTo: 'cknox@swin.edu.au',
    subject: approved
      ? `Booking confirmed — ${booking.title}`
      : `Booking declined — ${booking.title}`,
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
  await sendBookingEmail(id, true)
  revalidatePath('/admin')
}

export async function rejectBookingById(id: string) {
  const supabase = createAdminClient()
  await supabase.from('bookings').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
  await sendBookingEmail(id, false)
  revalidatePath('/admin')
}
