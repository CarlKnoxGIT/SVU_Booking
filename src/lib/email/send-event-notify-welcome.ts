import { resend, FROM_ADDRESS } from '@/lib/resend/client'

interface EventNotifyWelcomeParams {
  to: string
  name: string
}

export async function sendEventNotifyWelcome(params: EventNotifyWelcomeParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping notify welcome')
    return
  }

  const { to, name } = params

  const text = [
    `You're on the list — SVU Open Day`,
    '',
    `Hi ${name},`,
    '',
    `Thanks for signing up. We'll send you one email when new SVU Open Day sessions are announced — that's it. No newsletters, no spam.`,
    '',
    `If you didn't sign up, you can ignore this message and we'll never email you again.`,
    '',
    '---',
    `Swinburne's Virtual Universe · Hawthorn Campus, Melbourne`,
    `Questions? Reply to this email.`,
  ].join('\n')

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: 'cknox@swin.edu.au',
    subject: `You're on the list — SVU Open Day`,
    text,
    tags: [{ name: 'type', value: 'event-notify-welcome' }],
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Open Sans',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.3);text-transform:uppercase;">
            Swinburne's Virtual Universe
          </p>
        </td></tr>

        <tr><td style="padding:40px 0 24px;">
          <p style="margin:0 0 8px;font-size:32px;font-weight:300;line-height:1.1;">You're on the list.</p>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
            Hi ${name}, thanks for signing up.
          </p>
        </td></tr>

        <tr><td style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);padding:24px 28px;">
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.7;">
            We'll send you one email when new SVU Open Day sessions are announced — that's it. No newsletters, no spam.
          </p>
        </td></tr>

        <tr><td style="padding:24px 0 0;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.7;">
            If you didn't sign up, you can ignore this message and we'll never email you again.
          </p>
        </td></tr>

        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;margin-top:32px;">
          <p style="margin:32px 0 0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.6;">
            Swinburne University of Technology · Hawthorn Campus, Melbourne<br>
            Questions? Reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch(err => console.error('[event-notify welcome]', err))
}
