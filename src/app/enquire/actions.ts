'use server'

import { createClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

type State = { error?: string; success?: boolean } | null

const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate', product_launch: 'Product launch', conference: 'Conference',
  school: 'School group', private: 'Private', other: 'Other',
}

export async function submitEnquiry(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const organisation = formData.get('organisation') as string
  const event_type = formData.get('event_type') as string
  const guest_count = formData.get('guest_count') as string
  const preferred_date = formData.get('preferred_date') as string
  const message = formData.get('message') as string

  if (!name || !email || !event_type) {
    return { error: 'Please fill in all required fields.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('enquiries').insert({
    name,
    email,
    organisation: organisation || null,
    event_type,
    guest_count: guest_count ? parseInt(guest_count) : null,
    preferred_date: preferred_date || null,
    message: message || null,
    status: 'new',
  })

  if (error) {
    console.error('Enquiry insert error:', error)
    return { error: 'Something went wrong. Please try again or email us directly.' }
  }

  // Notify admin
  const enquiryText = [
    `New SVU enquiry — ${name}`,
    '',
    `Email:      ${email}`,
    ...(organisation ? [`Organisation: ${organisation}`] : []),
    `Event type: ${EVENT_TYPE_LABELS[event_type] ?? event_type}`,
    ...(guest_count ? [`Guests:     ${guest_count}`] : []),
    ...(preferred_date ? [`Preferred date: ${preferred_date}`] : []),
    ...(message ? ['', 'Message:', message] : []),
    '',
    `Reply to this email to respond directly to ${name}.`,
  ].join('\n')

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ['cknox@swin.edu.au', 'carlknox@gmail.com'],
    replyTo: email,
    subject: `New SVU enquiry — ${name}${organisation ? ` (${organisation})` : ''}`,
    text: enquiryText,
    tags: [{ name: 'type', value: 'enquiry-notification' }],
    html: `
      <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">New enquiry</p>
        <h2 style="margin:0 0 24px;font-size:20px;font-weight:500;">${name}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;width:120px;">Email</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;"><a href="mailto:${email}" style="color:#e8544a;">${email}</a></td></tr>
          ${organisation ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Organisation</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${organisation}</td></tr>` : ''}
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Event type</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${EVENT_TYPE_LABELS[event_type] ?? event_type}</td></tr>
          ${guest_count ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Guests</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${guest_count}</td></tr>` : ''}
          ${preferred_date ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Preferred date</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${preferred_date}</td></tr>` : ''}
        </table>
        ${message ? `<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Message</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;white-space:pre-wrap;">${message}</p>
        </div>` : ''}
        <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.2);">Reply to this email to respond directly to ${name}.</p>
      </div>`,
  }).catch(err => console.error('[enquiry notify]', err))

  return { success: true }
}
