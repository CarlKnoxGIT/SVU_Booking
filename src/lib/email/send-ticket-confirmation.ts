import QRCode from 'qrcode'
import { createAdminClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

interface TicketConfirmationParams {
  to: string
  name: string
  eventTitle: string
  eventDate: string   // e.g. "Saturday 11 April 2026"
  startTime: string   // e.g. "12:00"
  endTime: string     // e.g. "12:45"
  quantity: number
  qrCode?: string     // UUID stored on the ticket record
  cancelToken?: string
}

export async function sendTicketConfirmation(params: TicketConfirmationParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping')
    return
  }

  const { to, name, eventTitle, eventDate, startTime, endTime, quantity, qrCode, cancelToken } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const cancelUrl = cancelToken ? `${appUrl}/tickets/cancel?token=${cancelToken}` : null

  // Upload QR to Supabase Storage and get a public URL
  let qrImageUrl: string | null = null
  if (qrCode) {
    try {
      const png = await QRCode.toBuffer(qrCode, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      const supabase = createAdminClient()
      const path = `${qrCode}.png`
      const { error: uploadError } = await supabase.storage.from('qr-codes').upload(path, png, {
        contentType: 'image/png',
        upsert: true,
      })
      if (uploadError) {
        console.error('[email] QR storage upload error:', uploadError)
      } else {
        const { data } = supabase.storage.from('qr-codes').getPublicUrl(path)
        qrImageUrl = data.publicUrl
        console.log('[email] QR image URL:', qrImageUrl)
      }
    } catch (err) {
      console.error('[email] QR upload failed:', err)
    }
  }

  const ticketWord = quantity === 1 ? 'ticket' : 'tickets'

  const textLines = [
    `You're in — ${eventTitle}`,
    '',
    `Hi ${name}, your ${ticketWord} for ${eventTitle} ${quantity === 1 ? 'is' : 'are'} confirmed.`,
    '',
    `Date:     ${eventDate}`,
    `Time:     ${startTime}–${endTime}`,
    `Location: Swinburne, Hawthorn Campus, ATC Building, Room 103`,
    `Tickets:  ${quantity} × ${eventTitle}`,
    ...(qrCode ? ['', `QR code: ${qrCode}`, 'Show this code at the door.'] : []),
    '',
    'ON THE DAY',
    '· Arrive 10 minutes before your session.',
    '· Head to ATC Building, Room 103.',
    '· Show this email at the door.',
    ...(cancelUrl ? ['', `Can't make it? Cancel your tickets: ${cancelUrl}`] : []),
    '',
    '---',
    'Swinburne University of Technology · Hawthorn Campus, Melbourne',
    'Questions? Reply to this email.',
  ]

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: 'cknox@swin.edu.au',
    subject: `You're in — ${eventTitle}`,
    text: textLines.join('\n'),
    tags: [{ name: 'type', value: 'ticket-confirmation' }],
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
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Swinburne, Hawthorn Campus<br>ATC Building, Room 103</p>
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

        <!-- QR Code -->
        ${qrImageUrl ? `
        <tr><td style="padding:32px 0 0;text-align:center;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;text-align:left;">Your ticket</p>
          <img src="${qrImageUrl}" width="160" height="160" alt="Entry QR code" style="display:block;margin:0 auto;border:1px solid rgba(255,255,255,0.08);padding:12px;background:#fff;" />
          <p style="margin:12px 0 0;font-size:11px;color:rgba(255,255,255,0.2);">Show this QR code at the door</p>
        </td></tr>` : ''}

        <!-- What to expect -->
        <tr><td style="padding:32px 0;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:rgba(255,255,255,0.25);text-transform:uppercase;">On the day</p>
          <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Arrive 10 minutes before your session.</p>
          <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Head to ATC Building, Room 103.</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">· Show this email at the door.</p>
        </td></tr>

        <!-- Cancel link -->
        ${cancelUrl ? `
        <tr><td style="padding:0 0 28px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.8;">
            Can't make it? <a href="${cancelUrl}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Cancel your tickets</a> before the event to receive a full refund.
          </p>
        </td></tr>` : ''}

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
  console.log('[email] Resend result:', JSON.stringify(result))
}
