import { resend, FROM_ADDRESS } from '@/lib/resend/client'

interface EventNotifyAdminParams {
  name: string
  email: string
  source: string
}

export async function sendEventNotifyAdminNotification(params: EventNotifyAdminParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping admin notify')
    return
  }

  const { name, email, source } = params
  const timestamp = new Date().toISOString()

  const text = [
    `New notify-me signup — ${name}`,
    '',
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Source:  ${source}`,
    `When:    ${timestamp}`,
    '',
    `Reply to this email to respond directly to ${name}.`,
  ].join('\n')

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: ['cknox@swin.edu.au', 'carlknox@gmail.com'],
    replyTo: email,
    subject: `New notify-me signup: ${name}`,
    text,
    tags: [{ name: 'type', value: 'event-notify-admin' }],
    html: `
      <div style="font-family:sans-serif;background:#000;color:#fff;padding:32px;max-width:560px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.3);text-transform:uppercase;">New signup</p>
        <h2 style="margin:0 0 24px;font-size:20px;font-weight:500;">${name}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;width:120px;">Email</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;"><a href="mailto:${email}" style="color:#e8544a;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">Source</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${source}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.12em;">When</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.8);">${timestamp}</td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.2);">Reply to this email to respond directly to ${name}.</p>
      </div>`,
  }).catch(err => console.error('[event-notify admin]', err))
}
