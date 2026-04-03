# SVU_Booking — Integrations

## Overview

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Swinburne SSO (SAML 2.0)** | Staff and admin authentication | To configure |
| **Stripe** | Payment processing, invoices, refunds | To configure |
| **Google Calendar API** | Sync bookings to ops calendar | To configure |
| **Microsoft Graph API** | Outlook calendar sync for staff | Optional / future |
| **Resend** | Transactional email | To configure |
| **QR Code generation** | E-ticket QR codes | Package install only |

---

## 1. Swinburne SSO — SAML 2.0

### Purpose
Allow Swinburne staff and admins to log in using their Swinburne university credentials (no separate password required).

### Implementation
- Configured as a **SAML 2.0 provider** in Supabase Auth
- Swinburne IT provides the **IdP metadata URL** or XML file
- On login, SAML assertion contains email (`@swinburne.edu.au`), name, and staff role attributes
- Post-login hook in Supabase automatically creates/updates the `users` record with role `staff`

### Setup Steps
1. Register SVU Booking as a Service Provider (SP) with Swinburne IT
2. Provide Swinburne IT with:
   - SP Entity ID: `https://svu-booking.swinburne.edu.au`
   - ACS URL: `https://svu-booking.swinburne.edu.au/auth/callback`
3. Receive IdP metadata XML from Swinburne IT
4. Configure SAML provider in Supabase dashboard under Authentication → Providers → SAML 2.0
5. Map SAML attributes to Supabase user metadata fields

### Notes
- Super Admin role is NOT granted via SAML — it must be manually set in the `users` table
- Non-Swinburne users (school contacts, hirers, public) use standard email/social login

---

## 2. Stripe

### Purpose
Process payments for public event tickets and external hire fees.

### Products Used
- **Stripe Checkout** — hosted payment page for public ticket purchases
- **Stripe Payment Links** — for external hire invoices requiring simple payment
- **Stripe Invoices** — for formal hire agreements (PDF invoice, itemised)
- **Stripe Webhooks** — real-time payment status updates

### Webhook Events Handled
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Confirm booking, generate QR ticket, send confirmation email |
| `payment_intent.succeeded` | Update payment record status to `succeeded` |
| `payment_intent.payment_failed` | Notify user, release held slot |
| `charge.refunded` | Update booking/ticket status, send refund confirmation email |
| `invoice.paid` | Confirm hire booking after invoice payment |

### Webhook Setup
- Webhook endpoint: `POST /api/webhooks/stripe`
- Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- Never skip signature verification — all events must be authenticated

### Environment Variables
```
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for development
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Notes
- All amounts in AUD cents (e.g. $25.00 = 2500)
- Stripe customer created on first payment; stored in `payments.stripe_customer_id`
- University may have a preferred payment gateway for staff recharges — Stripe handles public/hirer flows for now

---

## 3. Google Calendar API

### Purpose
Sync confirmed bookings to a Swinburne ops/operations calendar so facility managers see the full schedule in Google Calendar.

### Authentication
- **Service Account** (server-to-server, no user OAuth required)
- Service account granted Editor access to the SVU operations calendar
- Credentials stored as JSON key file (never committed to repo)

### Operations
| Operation | Trigger |
|-----------|---------|
| `events.insert` | Booking confirmed |
| `events.update` | Booking details changed |
| `events.delete` | Booking cancelled |

### Calendar Event Format
```json
{
  "summary": "[BOOKING TYPE] - [User/Organisation Name]",
  "description": "Booking ID: ...\nAttendees: ...\nRequirements: ...",
  "start": { "dateTime": "2026-04-15T09:00:00+10:00", "timeZone": "Australia/Melbourne" },
  "end":   { "dateTime": "2026-04-15T11:00:00+10:00", "timeZone": "Australia/Melbourne" },
  "colorId": "booking_type_colour"
}
```

### Environment Variables
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}   # JSON stringified
GOOGLE_CALENDAR_ID=svu-ops@swinburne.edu.au                # Ops calendar ID
```

---

## 4. Microsoft Graph API (Outlook Calendar)

### Purpose
Optional: Send Outlook-compatible calendar invites to Swinburne staff who use Outlook rather than Google Calendar.

### Authentication
- OAuth 2.0 client credentials flow
- App registered in Azure Active Directory (Swinburne's tenant)
- Permissions: `Calendars.ReadWrite`

### Implementation Notes
- Used as an alternative/supplement to Google Calendar for individual invites
- iCal (.ics) attachments via Resend email are the simpler alternative if Graph is complex to set up
- **Priority**: Lower — implement after Google Calendar is working

### Environment Variables
```
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

---

## 5. Resend (Email)

### Purpose
Send all transactional emails: booking confirmations, rejections, QR e-tickets, reminders, quotes, payment receipts.

### SDK
```bash
npm install resend @react-email/components
```

### Email Templates (React Email)
| Template File | Use |
|--------------|-----|
| `emails/booking-confirmed.tsx` | All booking type confirmations |
| `emails/booking-rejected.tsx` | Rejection with reason + alternatives |
| `emails/ticket-purchase.tsx` | Public event ticket with QR code attachment |
| `emails/quote-proposal.tsx` | External hire quote |
| `emails/payment-reminder.tsx` | Unpaid hire invoice reminder |
| `emails/event-reminder.tsx` | 24h and 1h pre-event reminder |
| `emails/maintenance-conflict.tsx` | Notice to affected booking holders |
| `emails/clarification-request.tsx` | Intake Agent follow-up for incomplete forms |

### Sending Pattern
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'SVU Bookings <bookings@svu.swinburne.edu.au>',
  to: recipientEmail,
  subject: 'Your SVU Booking Confirmation',
  react: BookingConfirmedEmail({ booking }),
  attachments: qrCodeBuffer ? [{
    filename: 'ticket.png',
    content: qrCodeBuffer
  }] : []
})
```

### Domain Setup
- Verify sending domain `svu.swinburne.edu.au` with Resend (DNS TXT records)
- Coordinate with Swinburne IT for DNS access

### Environment Variables
```
RESEND_API_KEY=re_...
```

---

## 6. QR Code Generation

### Purpose
Generate unique, tamper-resistant QR codes for public event e-tickets. Scanned at entry.

### Package
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### Generation Pattern
```typescript
import QRCode from 'qrcode'
import crypto from 'crypto'

// Generate signed token
function generateTicketToken(ticketId: string): string {
  const payload = `${ticketId}:${Date.now()}`
  const signature = crypto
    .createHmac('sha256', process.env.QR_SECRET_KEY!)
    .update(payload)
    .digest('hex')
  return `${payload}:${signature}`
}

// Generate QR code as PNG buffer (for email attachment)
async function generateQRBuffer(ticketId: string): Promise<Buffer> {
  const token = generateTicketToken(ticketId)
  return QRCode.toBuffer(token, {
    type: 'png',
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'H'
  })
}
```

### Validation at Entry
- Scan QR → decode token → verify HMAC signature → look up `ticket_id` in DB
- Check ticket status is `active`
- Mark ticket as `used`, set `checked_in_at` timestamp

### Environment Variables
```
QR_SECRET_KEY=...   # Random 32+ char string for HMAC signing
```

---

## Integration Dependencies Map

```
User Action
    │
    ├── Auth (Swinburne SSO / Supabase Auth)
    │
    ├── Booking confirmed
    │       ├── Stripe (if payment required)
    │       ├── Google Calendar (sync event)
    │       ├── Resend (confirmation email)
    │       │       └── QR Code (if public ticket)
    │       └── Supabase (DB update)
    │
    └── Booking cancelled
            ├── Stripe (refund if applicable)
            ├── Google Calendar (delete event)
            └── Resend (cancellation email)
```
