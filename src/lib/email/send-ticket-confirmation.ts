'use server'

import { resend, FROM_ADDRESS } from '@/lib/resend/client'

interface TicketConfirmationParams {
  to: string
  name: string
  eventTitle: string
  eventDate: string   // e.g. "Saturday 11 April 2026"
  startTime: string   // e.g. "12:00"
  endTime: string     // e.g. "12:45"
  quantity: number
}

export async function sendTicketConfirmation(params: TicketConfirmationParams) {
  if (!process.env.RESEND_API_KEY) return // silently skip if not configured

  const { to, name, eventTitle, eventDate, startTime, endTime, quantity } = params

  const ticketWord = quantity === 1 ? 'ticket' : 'tickets'

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You're in — ${eventTitle}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Open Sans',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.3);text-transform:uppercase;">
            Swinburne's Virtual Universe
          </p>
        </td></tr>

        <!-- Confirmation -->
        <tr><td style="padding:40px 0 32px;">
          <p style="margin:0 0 8px;font-size:32px;font-weight:300;line-height:1.1;">You're in.</p>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
            Hi ${name}, your ${ticketWord} for <strong style="color:#fff;">${eventTitle}</strong> ${quantity === 1 ? 'is' : 'are'} confirmed.
          </p>
        </td></tr>

        <!-- Event details -->
        <tr><td style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);padding:24px 28px;margin-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">Date</p>
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">${eventDate}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">Time</p>
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">${startTime}–${endTime}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">Location</p>
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Swinburne's Virtual Universe<br>John Street, Hawthorn VIC 3122</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">Tickets</p>
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">${quantity} × ${eventTitle}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- What to expect -->
        <tr><td style="padding:32px 0;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">On the day</p>
          <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Arrive 10 minutes before your session.</p>
          <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Entry is via John Street, Hawthorn Campus.</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Show this email at the door.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.6;">
            Swinburne University of Technology · Hawthorn Campus, Melbourne<br>
            Questions? Reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
