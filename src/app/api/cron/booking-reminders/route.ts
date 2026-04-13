export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()

  // Find confirmed bookings starting in the next 24–25 hours
  const from = new Date()
  from.setHours(from.getHours() + 23)
  const to = new Date()
  to.setHours(to.getHours() + 25)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, title, start_time, end_time, booking_type, users!bookings_user_id_fkey(email, full_name)')
    .eq('status', 'confirmed')
    .gte('start_time', from.toISOString())
    .lte('start_time', to.toISOString())

  if (error) {
    console.error('[booking-reminders] query error:', error)
    return new Response('Error', { status: 500 })
  }

  if (!bookings || bookings.length === 0) {
    return new Response('No reminders to send', { status: 200 })
  }

  let sent = 0
  for (const booking of bookings) {
    const user = Array.isArray(booking.users) ? booking.users[0] : booking.users as { email: string; full_name: string } | null
    if (!user?.email) continue

    const startAt = new Date(booking.start_time)
    const endAt = booking.end_time ? new Date(booking.end_time) : null

    const dateStr = startAt.toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const timeStr = startAt.toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const endStr = endAt ? ` – ${endAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}` : ''

    const reminderText = [
      'Your booking is tomorrow.',
      '',
      `Booking:  ${booking.title}`,
      `Date:     ${dateStr}`,
      `Time:     ${timeStr}${endStr}`,
      `Location: Swinburne, Hawthorn Campus, ATC Building, Room 103`,
      '',
      'If you need to cancel, please log in to your staff dashboard.',
    ].join('\n')

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.email,
      replyTo: 'cknox@swin.edu.au',
      subject: `Reminder: ${booking.title} is tomorrow`,
      text: reminderText,
      tags: [{ name: 'type', value: 'booking-reminder' }],
      html: `
        <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SVU Booking</p>
          <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">Your booking is tomorrow.</h2>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Booking</p>
            <p style="margin:0 0 16px;font-size:16px;color:#fff;">${booking.title}</p>
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Date &amp; Time</p>
            <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.8);">${dateStr}</p>
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Time</p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">${timeStr}${endStr}</p>
          </div>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);">Location: Swinburne, Hawthorn Campus, ATC Building, Room 103</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:16px;">If you need to cancel, please log in to your staff dashboard.</p>
        </div>`,
    }).catch(err => console.error('[booking-reminders] email error:', err))

    sent++
  }

  console.log(`[booking-reminders] sent ${sent} reminders`)
  return new Response(`Sent ${sent} reminders`, { status: 200 })
}
