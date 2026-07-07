# SVU_Booking — Integrations

## Overview

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Swinburne SSO (SAML 2.0)** | Staff and admin authentication | To configure |
| **Eventbrite** | Public ticket sales + live remaining-ticket counts | Live (Session 10) |
| **Stripe** | Hire invoices/refunds; internal ticket checkout (fallback, unused for Open Day) | Live |
| **Google Calendar API** | Sync bookings to ops calendar | To configure |
| **Microsoft Graph API** | Outlook calendar sync for staff | Optional / future |
| **Resend** | Transactional email | Live |
| **QR Code generation** | E-ticket QR codes | Live (internal checkout path) |

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

## 2. Eventbrite

### Purpose
Sell public event tickets on Eventbrite (external checkout) and display live remaining-ticket counts on our `/events` pages. Replaces the built-in Stripe checkout for public sessions (motivated by the `svu3d.ai` email deliverability issues — see Session 9 notes).

### Implementation
- Each event stores its Eventbrite URL in `events.humanitix_url` (legacy field name, repurposed)
- `src/lib/eventbrite/client.ts` extracts the numeric event ID from the URL's trailing segment (e.g. `...tickets-1987296014877`)
- `getTicketAvailability(url)` tries two sources in order:
  1. **`getCountsFromApi`** — authenticated `GET /v3/events/{id}/ticket_classes/`. Sums `quantity_total − quantity_sold` across ticket classes that have a cap set. Returns exact `{ ticketsLeft, capacity, soldOut }`. Used by **single** events.
  2. **`getStatusFromDestination`** — public `GET https://www.eventbrite.com/api/v3/destination/events/?event_ids={id}&expand=ticket_availability` (no auth token needed). Returns `{ soldOut, minPrice }` (no exact count) from `is_sold_out` / `has_available_tickets` / `minimum_ticket_price`. Used by **recurring** events, whose authenticated ticket quantities come back `null`.
- `getSessionCount(url)` — `GET /v3/series/{id}/events/`; returns the number of showtimes (404s for single events → `null`).
- `TicketAvailability.ticketsLeft` / `capacity` are **optional** (undefined for recurring events); `minPrice` added for "From $X" display.
- Cached for 60s via Next.js `fetch({ next: { revalidate: 60, tags } })` — private token never reaches the browser.
- Returns `null` on missing token, missing/invalid URL, or API failure — `/events` and `/events/[id]/tickets` fall back silently to DB counts (stale but non-breaking).

### Recurring (series) events — important limitation
- Eventbrite's **authenticated API returns `null`** for `quantity_total`, `quantity_sold`, and event `capacity` on recurring events (at the series parent, every occurrence, and every ticket class). Confirmed the same token returns full counts for single events — it's a **format limitation, not a token/scope issue**.
- Therefore an exact "N of 80 left" counter is **impossible** for recurring events via any API. To get the live counter (like the Open Day sessions), the event must be **single (non-recurring)**.
- For recurring events we instead show live sold-out status + "From $X" + "N shows available", and link to the **series parent** URL (`...tickets-{parentId}`) so visitors get the built-in timeslot picker. Note the destination endpoint returns `is_sold_out: null` on the *parent* (sold-out is tracked per occurrence), which our code correctly treats as "not sold out".
- Live example: "Worlds of the Solar System" (series parent `1993301117300`, occurrences `...142375` @12:00 and `...143378` @13:15).

### UI behaviour
- `/events`: shows `X of Y tickets left` (single events only) next to price; switches to red when `≤10` remaining; "Get tickets" becomes a greyed **Sold out** pill when sold out. For recurring events: shows **"N shows available"** in place of a single time and **"From $X"** for the price.
- `/events/[id]/tickets`: "Tickets" info row shows live remaining/capacity from Eventbrite (single events)

### Getting a token
1. Sign in to Eventbrite as the account owning the events
2. Go to https://www.eventbrite.com/platform/api-keys/
3. Create an API Key if none exists; copy the **Private Token** (not the Public one)
4. Set `EVENTBRITE_PRIVATE_TOKEN` in `.env.local` (dev) and in Vercel → Project → Settings → Environment Variables → Production (live)
5. Redeploy — env vars only take effect on builds started *after* they're saved

### Environment Variables
```
EVENTBRITE_PRIVATE_TOKEN=...   # server-only; never expose via NEXT_PUBLIC_*
```

### Known edge case
Our code treats "sold out" purely as `quantity_total - quantity_sold === 0`. Eventbrite can independently set `on_sale_status` to `SOLD_OUT` or `UNAVAILABLE` (e.g. if a ticket class is manually closed). If that matters, tighten `src/lib/eventbrite/client.ts` to treat non-`AVAILABLE` statuses as sold out.

---

## 3. Stripe

### Purpose
Process invoice payments for external hires. Also wired as a fallback public-ticket checkout if `events.humanitix_url` is null — not currently used for any live event (Open Day sessions all route to Eventbrite).

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

## 4. Google Calendar API

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

## 5. Microsoft Graph API (Outlook Calendar)

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

## 6. Resend (Email)

### Purpose
Send all transactional emails: booking confirmations, rejections, QR e-tickets, reminders, quotes, payment receipts, admin notifications.

### SDK
```bash
npm install resend @react-email/components
```

### Admin Notification Recipients
All admin notification emails go to **both** `svu@swin.edu.au` and `cknox@swin.edu.au`.

| Trigger | File | Recipients |
|---------|------|-----------|
| School interest registration | `src/app/school-groups/actions.ts` | `svu@`, `cknox@` |
| Hire enquiry | `src/app/enquire/actions.ts` | `svu@`, `cknox@` |
| Event notify-me signup | `src/lib/email/send-event-notify-admin-notification.ts` | `cknox@`, `svu@` |
| Staff access request | `src/app/staff/register/actions.ts` | `cknox@`, `svu@` |
| User registration request | `src/app/register/actions.ts` | `cknox@`, `svu@` |

> Note: `@swin.edu.au` addresses may be silently dropped by Swinburne Exchange (unresolved — see PROGRESS.md Session 8/9). Both addresses receive every notification as a workaround.

### Email Templates
React Email templates are **not yet built** — all emails use inline HTML + plain-text strings. Template files listed below are aspirational:

| Template File | Use |
|--------------|-----|
| `emails/booking-confirmed.tsx` | All booking type confirmations |
| `emails/booking-rejected.tsx` | Rejection with reason + alternatives |
| `emails/ticket-purchase.tsx` | Public event ticket with QR code attachment |
| `emails/quote-proposal.tsx` | External hire quote |
| `emails/payment-reminder.tsx` | Unpaid hire invoice reminder |
| `emails/event-reminder.tsx` | 24h and 1h pre-event reminder |

### Sending Pattern (current — inline HTML)
```typescript
import { resend, FROM_ADDRESS } from '@/lib/resend/client'

await resend.emails.send({
  from: FROM_ADDRESS,               // 'SVU Bookings <bookings@svu3d.ai>'
  to: ['svu@swin.edu.au', 'cknox@swin.edu.au'],
  replyTo: userEmail,
  subject: 'Subject here',
  text: plainTextBody,              // required — spam filters penalise HTML-only
  html: htmlBody,
  tags: [{ name: 'type', value: 'tag-for-resend-dashboard' }],
})
```

### Domain
Sending domain is `svu3d.ai` (not `swinburne.edu.au`). SPF + DKIM are verified in GoDaddy. DMARC record is pending (GoDaddy syntax issue — see PROGRESS.md).

### Environment Variables
```
RESEND_API_KEY=re_...
```

---

## 7. QR Code Generation

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
    ├── Public event ticket
    │       ├── Eventbrite (sale + confirmation email, external)
    │       └── Eventbrite API → /events pages (live remaining counts, cached 60s)
    │
    ├── Booking confirmed (hire / internal)
    │       ├── Stripe (if payment required)
    │       ├── Google Calendar (sync event)
    │       ├── Resend (confirmation email)
    │       │       └── QR Code (if internal ticket path is used)
    │       └── Supabase (DB update)
    │
    └── Booking cancelled
            ├── Stripe (refund if applicable)
            ├── Google Calendar (delete event)
            └── Resend (cancellation email)
```
