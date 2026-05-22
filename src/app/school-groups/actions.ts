'use server'

import { createClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

type State = { error?: string; success?: boolean } | null

export async function submitSchoolInterest(_prevState: State, formData: FormData): Promise<State> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const school = formData.get('school') as string
  const year_level = formData.get('year_level') as string
  const student_count = formData.get('student_count') as string
  const notes = formData.get('notes') as string

  if (!name || !email || !school) {
    return { error: 'Please fill in all required fields.' }
  }

  const messageParts = [`Year level(s): ${year_level || 'Not specified'}`]
  if (notes?.trim()) messageParts.push(`\nNotes:\n${notes.trim()}`)
  const message = messageParts.join('\n')

  const supabase = await createClient()

  const { error } = await supabase.from('enquiries').insert({
    name,
    email,
    organisation: school,
    event_type: 'school',
    guest_count: student_count ? parseInt(student_count) : null,
    message,
    status: 'new',
  })

  if (error) {
    console.error('School interest insert error:', error)
    return { error: 'Something went wrong. Please try again or email us directly.' }
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ['svu@swin.edu.au', 'cknox@swin.edu.au'],
    replyTo: email,
    subject: `School interest — ${name} (${school})`,
    text: [
      `School visit interest — ${name}`,
      '',
      `Email:        ${email}`,
      `School:       ${school}`,
      `Year level(s): ${year_level || 'Not specified'}`,
      ...(student_count ? [`Students:     ${student_count}`] : []),
      ...(notes?.trim() ? ['', 'Notes:', notes.trim()] : []),
      '',
      `Reply to this email to respond directly to ${name}.`,
    ].join('\n'),
    tags: [{ name: 'type', value: 'school-interest' }],
    html: `
      <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">School interest</p>
        <h2 style="margin:0 0 24px;font-size:20px;font-weight:500;">${name}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;width:140px;">Email</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;"><a href="mailto:${email}" style="color:#e8544a;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">School</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${school}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Year level(s)</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${year_level || 'Not specified'}</td></tr>
          ${student_count ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Students</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${student_count}</td></tr>` : ''}
        </table>
        ${notes?.trim() ? `<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Notes</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;white-space:pre-wrap;">${notes.trim()}</p>
        </div>` : ''}
        <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.2);">Reply to this email to respond directly to ${name}.</p>
      </div>`,
  }).catch(err => console.error('[school interest notify]', err))

  return { success: true }
}
