'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

export async function broadcastMessage({
  from,
  to,
  subject,
  message,
}: {
  from: string
  to: string
  subject: string
  message: string
}): Promise<{ sent: number }> {
  const supabase = createAdminClient()

  const fromDate = new Date(`${from}T00:00:00`)
  const toDate = new Date(`${to}T23:59:59`)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, title, start_time, users!bookings_user_id_fkey(full_name, email)')
    .eq('status', 'confirmed')
    .gte('start_time', fromDate.toISOString())
    .lte('start_time', toDate.toISOString())

  if (error) throw new Error(error.message)
  if (!bookings || bookings.length === 0) return { sent: 0 }

  // Deduplicate by email
  const seen = new Set<string>()
  const recipients: { name: string; email: string; bookingTitle: string; date: string }[] = []

  for (const b of bookings) {
    const user = Array.isArray(b.users) ? b.users[0] : b.users as { full_name: string | null; email: string | null } | null
    if (!user?.email || seen.has(user.email)) continue
    seen.add(user.email)
    recipients.push({
      name: user.full_name ?? 'Staff',
      email: user.email,
      bookingTitle: b.title ?? '',
      date: new Date(b.start_time).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }

  const htmlMessage = message.replace(/\n/g, '<br>')

  await Promise.all(
    recipients.map(r => {
      const textBody = [
        subject,
        '',
        message,
        '',
        '---',
        `This message was sent regarding your booking: ${r.bookingTitle} on ${r.date}.`,
        'To stop receiving messages, reply with "Unsubscribe" in the subject line.',
      ].join('\n')

      return resend.emails.send({
        from: FROM_ADDRESS,
        to: r.email,
        replyTo: 'cknox@swin.edu.au',
        subject,
        text: textBody,
        tags: [{ name: 'type', value: 'broadcast' }],
        headers: {
          'List-Unsubscribe': '<mailto:cknox@swin.edu.au?subject=Unsubscribe>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'Precedence': 'bulk',
        },
        html: `
          <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SVU — Message from Admin</p>
            <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;">${subject}</h2>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.7;">${htmlMessage}</p>
            </div>
            <p style="font-size:12px;color:rgba(255,255,255,0.3);">This message was sent regarding your booking: <strong style="color:rgba(255,255,255,0.5);">${r.bookingTitle}</strong> on ${r.date}.</p>
          </div>`,
      }).catch(err => console.error('[broadcast]', r.email, err))
    })
  )

  return { sent: recipients.length }
}
