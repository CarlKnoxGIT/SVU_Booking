# SVU_Booking — Progress Log

## Session 1 — 2026-04-03

### Completed
- [x] Created project folder structure at `~/Desktop/SVU_Booking/`
- [x] Created `_docs/` subdirectory with all knowledge base files
- [x] Written `PROJECT_OVERVIEW.md` — facility details, vision, goals, use cases
- [x] Written `USER_ROLES.md` — 5 roles, permissions matrix, RLS summary
- [x] Written `BOOKING_FLOWS.md` — 6 complete end-to-end flows with edge cases
- [x] Written `AI_AGENTS.md` — 9 agents with tools, responsibilities, system prompts
- [x] Written `TECH_STACK.md` — full stack decisions with rationale and setup
- [x] Written `DATABASE_SCHEMA.md` — all tables, RLS policies, indexes, relationships
- [x] Written `INTEGRATIONS.md` — SSO, Stripe, Calendar, Email, QR codes
- [x] Written `STARTUP.md` — master session-start brief
- [x] Saved project memory entry in Claude Code memory system

### Decisions Made
- Framework: Next.js 14 App Router + TypeScript
- DB: Supabase (PostgreSQL + RLS + Realtime)
- Auth: Supabase Auth + SAML 2.0 for Swinburne SSO
- AI: Anthropic `claude-sonnet-4-6` for all agents
- Payments: Stripe (Checkout + Invoices + Webhooks)
- Email: Resend + React Email templates
- Deployment: Vercel (planned)

### Next Steps (Session 2) — COMPLETED in same sitting
- [ ] Set up Supabase Auth with email/social providers
- [ ] Begin SAML 2.0 SSO configuration (coordinate with Swinburne IT)
- [ ] Build auth middleware and role detection
- [ ] Create basic app layout and navigation structure

---

## Session 2 — 2026-04-03

### Completed
- [x] Installed Node.js v24 via nvm (no sudo required)
- [x] Initialised Next.js 14 App Router + TypeScript + Tailwind
- [x] Installed all dependencies: Supabase SSR, Anthropic SDK, Stripe, Resend, React Email, qrcode
- [x] Built `src/lib/` clients — Supabase (server + browser + admin), Anthropic, Stripe, Resend
- [x] Built `src/lib/anthropic/agent-runner.ts` — core tool-use loop for all agents
- [x] Built `src/middleware.ts` — auth protection + role-based route guards
- [x] Built `src/app/auth/callback/route.ts` — OAuth/SAML callback with auto user creation + role assignment
- [x] Built `src/app/api/webhooks/stripe/route.ts` — handles checkout, refund, payment_failed events
- [x] Built `src/types/index.ts` — full TypeScript type definitions for all DB entities
- [x] Written `supabase/migrations/001_initial_schema.sql` — all tables, RLS policies, indexes
- [x] Updated homepage (`src/app/page.tsx`) with SVU branding
- [x] Created `.env.example` with all required environment variable keys
- [x] TypeScript check passing (0 errors)
- [x] Initialised git repo, made initial commit (41 files)
- [x] Created private GitHub repo at github.com/CKnoxie/SVU_Booking and pushed

### Next Steps (Session 3) — COMPLETED in same sitting

---

## Session 3 — 2026-04-03

### Completed
- [x] Created Supabase project (`neibpbkholgoypswyalx`)
- [x] Ran `001_initial_schema.sql` — all 9 tables created with RLS policies (fixed function-before-table ordering bug)
- [x] Created `.env.local` with Supabase URL, anon key, service role key
- [x] Fixed Next.js 16 `middleware.ts` → `proxy.ts` rename + export rename
- [x] Cleared `.next` cache and confirmed dev server starts clean
- [x] Homepage live at `http://localhost:3000` — SVU branding, three feature cards

### Decisions Made
- Supabase project region: closest to Melbourne (Sydney)
- Next.js version is 16.2.2 (newer than planned 14 — middleware is now called `proxy`)
- Dev server runs on port 3000

### Next Steps (Session 4) — COMPLETED in same sitting

---

## Session 4 — 2026-04-03

### Completed
- [x] Installed shadcn/ui v4.1.2 — init with Tailwind v4, added Button, Input, Label, Card components
- [x] Noted: shadcn now uses Base UI (`@base-ui/react/button`) not Radix — no `asChild` prop; use `render` prop or `buttonVariants` on Link directly
- [x] Built `/login` page — email magic link (Server Action + `useActionState`) + Google OAuth button
- [x] Built `/auth/callback` (already existed from session 2) — handles both OAuth code exchange and auto user-creation
- [x] Built `/admin/layout.tsx` — super_admin role guard, sidebar nav (Dashboard, Bookings, Events, Users, Maintenance, Reports)
- [x] Built `/admin/page.tsx` — stats cards (total bookings, pending, users, revenue MTD) + recent bookings table
- [x] Built `/admin/actions.ts` — signOut server action
- [x] Built `/staff/layout.tsx` — staff/super_admin role guard, sidebar with Admin Panel link for admins
- [x] Built `/staff/page.tsx` — personal booking dashboard split into upcoming / past
- [x] Built `/staff/book/page.tsx` + `booking-form.tsx` — full booking request form (type selector, title, description, date/time, duration, attendee count)
- [x] Built `/staff/book/actions.ts` — `createBookingRequest` server action inserts booking and redirects to confirm
- [x] Built `/staff/book/confirm/page.tsx` — post-submission confirmation page showing booking details
- [x] TypeScript check: 0 errors

### Decisions Made
- shadcn/ui v4 uses Base UI buttons — `asChild` is not available; use `buttonVariants` + `<Link>` for navigation buttons
- `useActionState` requires server action signature `(prevState, formData)` — added `_prevState` param to all actions
- `signInWithGoogle` redirects on both success and failure (no error object return) so it satisfies `() => Promise<void>` for form action type

### Next Steps (Session 5) — COMPLETED

---

## Session 5 — 2026-04-06

### Completed

#### Public-facing pages
- [x] Built `/events` — public events listing with date, tickets-left, Humanitix integration
- [x] Built `/events/[id]/tickets` — Stripe ticket checkout (quantity selector, capacity check, redirect to Stripe)
- [x] Built `/events/[id]/tickets/success` — post-purchase confirmation page
- [x] Built `/school-groups` — full educational visits page (programs, how-it-works, CTA)
- [x] Built `/enquire` — private hire enquiry form with `EnquiryForm` client component
- [x] Built `/staff/register` — staff access request form (name, email, reason; pending review flow)
- [x] Updated homepage — parallax hero, saturn scroll-scrub animation, 4 full photo sections (events, schools, hire, future), footer

#### Auth
- [x] Built `/auth/confirm` — client-side magic link token handler (sets session from URL fragment, creates user record, redirects)
- [x] Built `/auth/set-password` — password setup page for invited users

#### Staff portal
- [x] Built `/staff/book/calendar.tsx` — visual calendar date picker in booking form
- [x] Built `/staff/bookings/[id]/edit` — edit pending bookings (form + server action)
- [x] Built `cancel-booking-button.tsx` — client component for cancelling bookings from dashboard

#### Admin panel — heavily expanded
- [x] Rebuilt `/admin/page.tsx` — single long-scroll dashboard with all sections: Bookings calendar, Overview stats, Staff Requests, Events, Enquiries, Check-in, Users, Broadcast
- [x] Built `/admin/bookings/admin-calendar.tsx` — full interactive weekly calendar with approve/reject/edit/delete/bulk-select/create/block-dates modals
- [x] Built `/admin/bookings/actions.ts` — approve, reject, delete, bulk approve/delete, adminCreateBooking, adminUpdateBooking, adminUpdateAllByTitle, blockDates, email notifications on approve/reject
- [x] Built `/admin/events/page.tsx` — events list with attendance tracking, guest list download, duplicate, edit, publish status
- [x] Built `/admin/events/new` — create event form with image upload to Supabase Storage
- [x] Built `/admin/events/[id]/edit` — edit event form
- [x] Built `/admin/events/duplicate-button.tsx` — one-click event duplication
- [x] Built `/admin/enquiries/page.tsx` — expandable enquiry cards with status selector, reply-by-email link
- [x] Built `/admin/checkin/page.tsx` + `qr-scanner.tsx` — QR code scanner for event check-in (webcam + manual code)
- [x] Built `/admin/broadcast/broadcast-form.tsx` — email broadcast to all confirmed-booking staff in a date range
- [x] Built `/admin/staff-requests/page.tsx` + `actions.ts` — approve (sends Supabase invite) / reject staff access requests
- [x] Built `/admin/users/role-selector.tsx`, `delete-button.tsx`, `invite-staff.tsx` — inline role management and user deletion

#### API routes
- [x] Built `/api/checkout` — Stripe checkout session creation (validates capacity, builds line items, returns session URL)
- [x] Built `/api/reserve` — ticket reservation before checkout
- [x] Built `/api/qr/[code]` — QR code lookup for check-in (returns ticket + event details)
- [x] Built `/api/cron/booking-reminders` — automated 24h reminder emails to staff with upcoming confirmed bookings
- [x] Built `/api/admin/reports/attendance` — CSV attendance report across all events
- [x] Built `/api/admin/events/[id]/guests` — per-event guest list CSV export

#### Database migrations
- [x] `002_bookings_datetime.sql` — datetime column adjustments
- [x] `003_enquiries.sql` — enquiries table
- [x] `004_events_humanitix_url.sql` — Humanitix URL field on events
- [x] `005_qr_storage.sql` — QR code storage setup
- [x] `006_staff_requests.sql` — staff access request table
- [x] `007_event_image_url.sql` — image URL field on events
- [x] `008_vip_booking_type.sql` — VIP booking type enum value

### Decisions Made
- Magic link auth uses `/auth/confirm` (client-side) to handle URL fragment tokens — server-side can't read hash params
- Admin dashboard is a single scrollable page with anchored sections, not separate sub-pages (better for daily ops workflow)
- Booking calendar uses a weekly view with inline modals — no navigation to separate page required
- `blockDates` creates one `confirmed` booking per day in the range with `booking_type: 'maintenance'` — reuses existing bookings table
- Ticket checkout uses Stripe redirect (not embedded) — simpler, PCI-compliant
- `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` env var controls who gets `super_admin` role on first sign-in

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only ("Coming soon")
- [ ] `/admin/maintenance` — placeholder only ("Coming soon")
- [ ] `agents/` directory — completely empty; `agent-runner.ts` framework exists but no agents implemented
- [ ] `emails/` directory — empty; no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest` — not yet added
- [ ] React Email templates — booking confirmed, booking declined, ticket purchase, event reminder

---

## Session 6 — 2026-04-07

### Completed

#### Admin panel
- [x] Admin landing page consolidated into one giant scrollable dashboard (calendar at top, then Overview, Staff Requests, Events, Enquiries, Check-in, Users, Broadcast below)
- [x] Sidebar nav updated to anchor links (`/admin#bookings`, `#overview`, etc.) — no separate tabs
- [x] `/admin/dashboard/page.tsx` created as a standalone route (dead — not in nav, kept for reference)
- [x] Admin recent bookings list: inline Approve/Reject buttons for pending bookings
- [x] Admin booking calendar: calendar height uses `calc(100vh - 120px)` to fill viewport within scrollable page
- [x] Event max capacity limit raised from 60 → 100 in both new and edit event forms

#### Calendar improvements (both admin + staff)
- [x] Calendar always starts on Monday regardless of current day
- [x] Day headers moved inside the scroll container as `sticky top-0` — fixes misalignment caused by scrollbar width stealing space from columns
- [x] Calendar time range changed from 08:00–20:00 to 06:00–24:00; last label shows `00:00` not `24:00`
- [x] Click-and-drag on day columns to pre-select a time range before opening the new booking panel
- [x] `data-booking-block` attribute prevents drag from triggering when clicking existing booking blocks

#### Booking types & time display
- [x] Added `SVU Demo` booking type to all dropdowns (staff calendar, admin calendar, edit booking form)
- [x] Added `009_svu_demo_booking_type.sql` migration to update DB check constraint
- [x] Replaced all `<input type="time">` with custom `TimeSelect` component (`src/components/ui/time-select.tsx`) — two `<select>` elements for 00–23 hours and 00/15/30/45 minutes; guaranteed 24h on all browsers/OS

#### Public events on calendar
- [x] Published events from the `events` table auto-appear on both admin and staff calendars
- [x] Events rendered in orange (`public_event` colour), positioned from `event_date + start_time/end_time`
- [x] Admin calendar: clicking an event opens a read-only `EventDetailPanel` with "Manage events →" link
- [x] Staff calendar: event blocks are non-interactive (cursor default, click does nothing)
- [x] Events are non-draggable and excluded from bulk select

#### Bug fixes
- [x] Timezone bug: `getWeekBookings` and `getAdminWeekBookings` now pass `weekStart.toISOString()` instead of bare date string — fixes bookings disappearing due to UTC midnight vs local midnight mismatch
- [x] `src/app/staff/actions.ts` missing from prior commit — added `cancelSeries` export
- [x] `src/app/staff/book/page.tsx` was a plain client component missing `currentUserId` prop — converted to async server component that fetches the user profile

### Decisions Made
- Single scrollable admin dashboard preferred over tabbed layout (user preference)
- `TimeSelect` custom component is the only reliable cross-browser 24h time input on Windows/Chrome with Australian locale
- Events use `id: 'event_${uuid}'` prefix to avoid ID collision with booking UUIDs
- `source: 'booking' | 'event'` field added to `Booking` type to distinguish event blocks from real bookings

---

## Session 7 — 2026-04-08

### Completed

#### Mobile responsiveness (full pass)
- [x] Staff + admin booking calendars: auto-switch to 3-day view on mobile (`window.innerWidth < 768`)
- [x] Touch events (`onTouchStart`/`onTouchEnd`) on calendar day columns for mobile booking
- [x] Calendar nav arrows: hidden in toolbar on mobile, replaced by fixed bottom arrow bar (`position: fixed, bottom-16`) with large tap targets (`w-8 h-8 px-8`)
- [x] Bottom tab bar (`StaffBottomNav`) — mobile-only (`md:hidden`), fixed above device chrome, tabs: Calendar / Check-in / Admin (super_admin only, red tint), Profile avatar far-right
- [x] Sidebar converted to hamburger drawer on mobile; desktop sidebar remains resizable via drag handle
- [x] `pb-28 md:pb-0` on time grid to prevent content hiding behind fixed bars

#### QR scanner redesign
- [x] Camera stops immediately on scan (`stopScanner()` called inside `handleCode`)
- [x] Result card: coloured banner (emerald/amber/red) + guest name, ticket count, event + session time, already-scanned warning
- [x] "Scan next ticket" button restarts camera
- [x] `TallyBar` — fixed bar (`bottom-16`, above tab nav), always visible in all states, shows: `{checkedIn} in | {sold} sold [progress bar] {pct}%`
- [x] Tally counts ticket quantities (`.reduce` sum), not row count — fixes multi-ticket undercounting
- [x] Tally persists across scans; re-fetches after successful check-in for accurate count
- [x] Camera capped at `max-h-[45vh]` so result fits without scrolling

#### Ticket check-in: correct buyer name
- [x] Added `buyer_name` column to `tickets` table (`012_tickets_buyer_name.sql`)
- [x] Free ticket (`/api/reserve`): stores `buyer_name: name` from the form
- [x] Paid ticket (Stripe webhook): stores name from form via metadata (`session.metadata.buyer_name`), with fallbacks to `session.customer_details.name` then `payment_method.billing_details.name`
- [x] Checkout route passes `name` and `email` from form body into Stripe session metadata and `customer_email`
- [x] Check-in action reads `buyer_name` first; falls back to `users.full_name` only if null
- [x] `CheckInResult` type includes `eventDate`, `startTime`, `endTime`, `quantity`, `tally`

#### Ticket cancellation fix
- [x] Cancel form was fetching `/api/tickets/cancel` without `NEXT_PUBLIC_BASE_PATH` prefix — caused a JSON parse error masquerading as "Network error"
- [x] Fixed: `const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''` added to `cancel-form.tsx`

#### Infrastructure
- [x] Vercel, Supabase, and Resend all live and confirmed working as of this session
- [x] Staff check-in page (`/staff/checkin`) added — reuses admin `QrScanner` component

### Decisions Made
- `buyer_name` on tickets is the authoritative display name at check-in — account `full_name` is only a fallback
- Name flows: form input → API route → Stripe metadata → webhook → DB (not relying on Stripe's own name collection)
- All client-side `fetch` calls must prefix with `process.env.NEXT_PUBLIC_BASE_PATH ?? ''` — enforced across all routes now

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only ("Coming soon")
- [ ] `/admin/maintenance` — placeholder only ("Coming soon")
- [ ] `agents/` directory — framework exists but no agents implemented
- [ ] `emails/` directory — no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration

---

---

## Session 8 — 2026-04-09

### Completed

#### Email deliverability investigation + fixes
- [x] Diagnosed ticket emails not arriving at Hotmail and @swin.edu.au addresses
- [x] Confirmed via Resend SMTP log: emails ARE being delivered (250 response from `ausprd01.prod.outlook.com`) — problem is spam filtering, not sending failure
- [x] Root cause: `svu3d.ai` is a new domain with no sender reputation; Microsoft/Swinburne Exchange puts it in Junk
- [x] Added plain-text `text:` body to all 7 email-sending files (spam filters penalise HTML-only emails)
- [x] Added `List-Unsubscribe` + `List-Unsubscribe-Post` + `Precedence: bulk` headers to broadcast emails
- [x] Added `tags` to all emails for Resend dashboard tracking by type
- [x] TypeScript check: 0 errors

#### Files changed
- `src/lib/email/send-ticket-confirmation.ts`
- `src/app/admin/bookings/actions.ts`
- `src/app/api/cron/booking-reminders/route.ts`
- `src/app/admin/broadcast/actions.ts`
- `src/app/admin/staff-requests/actions.ts`
- `src/app/enquire/actions.ts`
- `src/app/staff/register/actions.ts`

### Decisions Made
- Plain-text email body is now mandatory alongside HTML for all sends — spam filter requirement
- Broadcast emails get bulk mail headers; transactional emails do not

### Remaining / Needs Carl's action (not code)
- [ ] **Resend dashboard → Domains → `svu3d.ai`** — verify all three DNS records (SPF, DKIM, DMARC) are green. DKIM especially is the key fix for Hotmail long-term
- [ ] **Add DMARC record** to DNS: `_dmarc.svu3d.ai` TXT → `v=DMARC1; p=quarantine; rua=mailto:cknox@swin.edu.au`
- [ ] **Register with Microsoft SNDS** at sendersupport.olc.protection.outlook.com/snds/ to improve Hotmail/Outlook.com reputation
- [ ] **Ask @swin.edu.au recipients** to check Junk folder, mark as Not Junk, add `bookings@svu3d.ai` to Safe Senders
- [ ] **`dianayousry@hotmail.com`** — never appeared in Resend logs; unclear if she purchased with hotmail or swin address. Needs investigation
- [ ] **Test send investigation** — last test (carlknox@gmail.com "just now") didn't appear in Resend list; needs retest after lunch to confirm email fires on purchase

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only ("Coming soon")
- [ ] `/admin/maintenance` — placeholder only ("Coming soon")
- [ ] `agents/` directory — framework exists but no agents implemented
- [ ] `emails/` directory — no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration

---

## Session 9 — 2026-04-13

### Completed

#### Ticket buttons — "Coming soon" mode
- [x] Replaced "Get tickets" links with "Coming soon" placeholder on homepage, events listing, and ticket page
- [x] Homepage hero button changed from `<Link>` to dimmed `<span>` (no navigation)
- [x] Events listing: events WITH an Eventbrite URL show "Get tickets" (links externally); events without show "Coming soon"
- [x] Currently ALL buttons set to "Coming soon" — to go live, restore the `humanitix_url` conditional in `src/app/events/page.tsx` (see "How to go live" below)

#### Eventbrite integration
- [x] Created Eventbrite pages for 3 of 4 sessions
- [x] Stored Eventbrite URLs in `humanitix_url` field on events table in Supabase (ready to use)
- [x] Session 4 remains unpublished (private link only)
- [x] Removed `is_published` filter from `/events/[id]/tickets/page.tsx` so unpublished events can be accessed via direct link
- [x] Removed ticket counter ("X tickets left") from events listing — capacity managed on Eventbrite
- [x] Added start–end time display (e.g. 12:00 – 12:45) on events listing

#### Eventbrite URLs stored in DB (ready to activate)
| Session | Time | Eventbrite URL |
|---------|------|---------------|
| Session 1 | 12:00–12:45 | `https://www.eventbrite.com.au/e/svu-open-day-tickets-1987296014877?aff=oddtdtcreator` |
| Session 2 | 13:00–13:45 | `https://www.eventbrite.com.au/e/svu-open-day-tickets-1987297229510?aff=oddtdtcreator` |
| Session 3 | 14:00–14:45 | `https://www.eventbrite.com.au/e/svu-open-day-session-3-tickets-1987299517353?aff=oddtdtcreator` |
| Session 4 | 15:00–15:45 | Not yet created — event is unpublished |

#### How to go live with ticket buttons
In `src/app/events/page.tsx`, replace the "Coming soon" `<span>` block with:
```jsx
{!soldOut && (
  event.humanitix_url ? (
    <a href={event.humanitix_url} target="_blank" rel="noopener noreferrer"
       className="flex-shrink-0 rounded-xl bg-swin-red px-4 py-2 text-[13px] font-semibold text-white hover:bg-swin-red-hover transition-all duration-200">
      Get tickets
    </a>
  ) : (
    <span className="flex-shrink-0 rounded-xl bg-white/20 px-4 py-2 text-[13px] font-semibold text-white/60 cursor-default">
      Coming soon
    </span>
  )
)}
```

#### Email deliverability
- [x] Confirmed: Resend sends successfully (green status), Gmail receives fine, but Swinburne Exchange silently drops emails from `svu3d.ai`
- [x] Added `carlknox@gmail.com` as second recipient on enquiry notification emails as workaround
- [x] DNS: SPF and DKIM verified in GoDaddy for `svu3d.ai`; DMARC record still needs adding (GoDaddy validation issue)
- [x] Domain DNS managed by GoDaddy (nameservers: `ns11.domaincontrol.com`, `ns12.domaincontrol.com`)

#### Login page
- [x] Removed "Continue with Google" OAuth button — staff login is email/password only (swin.edu.au staff)

### Decisions Made
- Public ticketing moved to Eventbrite instead of built-in Stripe checkout — avoids email deliverability issues with new domain
- `humanitix_url` DB field reused for Eventbrite URLs (field name is legacy but functional)
- Enquiry emails sent to both `cknox@swin.edu.au` and `carlknox@gmail.com` until Swinburne whitelists domain
- Google OAuth removed from staff login — only @swin.edu.au staff should have access

### Remaining / Needs Carl's action (not code)
- [ ] Add DMARC TXT record in GoDaddy: Name `_dmarc`, Value `v=DMARC1; p=quarantine; rua=mailto:cknox@swin.edu.au` (GoDaddy rejected — may need to contact GoDaddy support)
- [ ] Contact Swinburne IT to whitelist `svu3d.ai` / `bookings@svu3d.ai` in Exchange
- [ ] Create Eventbrite page for Session 4 (if needed) and provide URL
- [ ] Register with Microsoft SNDS for Hotmail/Outlook.com reputation

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only ("Coming soon")
- [ ] `/admin/maintenance` — placeholder only ("Coming soon")
- [ ] `agents/` directory — framework exists but no agents implemented
- [ ] `emails/` directory — no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration
- [ ] Re-enable homepage "Get tickets" hero button (currently "Coming soon" `<span>`)

---

## Session 10 — 2026-04-24

### Completed

#### Live ticket availability from Eventbrite
- [x] Built `src/lib/eventbrite/client.ts` — `extractEventIdFromUrl` + `getTicketAvailability` (60s `next: { revalidate }` cache, degrades to `null` on missing token / URL / API error)
- [x] Extracts numeric event ID from the trailing segment of the Eventbrite URL (e.g. `...-1987296014877`) — no DB change required
- [x] Sums `quantity_total − quantity_sold` across non-hidden ticket classes via `GET /v3/events/{id}/ticket_classes/`
- [x] `/events` listing: shows "X of Y tickets left" next to price (red when ≤10 remaining); replaces the "Get tickets" button with a "Sold out" badge when availability hits 0
- [x] `/events/[id]/tickets`: detail page "Tickets" row now reads from Eventbrite instead of `tickets_sold` (which isn't being updated since the move off built-in Stripe)
- [x] Both pages fall back silently to DB counts when the token is missing — safe to ship before token is set
- [x] Added `EVENTBRITE_PRIVATE_TOKEN` to `.env.example` with link to the API-keys page
- [x] Verified live against the production API: Session 1 = 71/110 left, Session 2 = 103/110 left, Session 3 = 24/110 left

#### Ticket lookup side quest
- [x] Bec Fowler (`r_miers@hotmail.com`) found: 4 tickets, Session 1 (2 May 12:00–12:45), active, booked 12 Apr
- [x] Akshita Raina (`akshitaraina005@gmail.com`) found: 1 ticket, Session 1, active, booked 13 Apr
- [x] Both bookings were on the old built-in Stripe flow (stored in `tickets` table). Need re-booking on Eventbrite for the relocated session.

### Decisions Made
- Eventbrite API called **server-side only**, with a 60s Next.js `revalidate` cache, so token never reaches the browser and the API isn't hammered on every request
- `EVENTBRITE_PRIVATE_TOKEN` is server-only (not `NEXT_PUBLIC_*`)
- Numeric-suffix URL parser accepts any `-<10+ digits>` segment — works for both the current URL shapes (`svu-open-day-tickets-...` and `swinburnes-virtual-universe-exclusive-public-opening-show-tickets-...`)
- No schema change — Eventbrite event ID is derived from `events.humanitix_url` at request time
- Session 3's Eventbrite URL changed at some point (DB now holds `...1987873639568`, previously `...1987299517353`) — current code reads whatever's in the DB so it kept working

### Remaining / Needs Carl's action (not code)
- [x] Re-book Bec Fowler (4 tix) and Akshita Raina (1 tix) — Carl re-booked under each buyer's email and sent them notification emails (post-session)
- [ ] Create Session 4 Eventbrite page if you want it on the public listing (otherwise it stays unpublished and hidden)
- [ ] Existing items from Session 9 still open: DMARC DNS, Swinburne Exchange whitelist, Microsoft SNDS registration

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only
- [ ] `/admin/maintenance` — placeholder only
- [ ] `/admin/tickets` search page (would replace "ask Claude to run a script") — possible next session
- [ ] `agents/` directory — framework exists but no agents implemented
- [ ] `emails/` directory — no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration
- [ ] Re-enable homepage "Get tickets" hero button (currently "Coming soon" `<span>`)

### Files changed
- `src/lib/eventbrite/client.ts` (new)
- `src/app/events/page.tsx`
- `src/app/events/[id]/tickets/page.tsx`
- `.env.example`

---

## Session 11 — 2026-04-29

### Completed

#### Visitor counts dashboard (public landing page)
- [x] Built "By the numbers" section between Saturn animation and Public Events
- [x] Hero "Total Visitors" number — auto-summed at request time from non-activity categories (Students + Staff + VIP + International Students + Academics)
- [x] 6-card breakdown grid below the hero (cards reuse admin stats grid styling)
- [x] Animated count-up on first viewport intersection (`src/components/visitor-stats/count-up.tsx`), respects `prefers-reduced-motion`
- [x] `revalidate = 60` on homepage; `revalidatePath('/')` on every entry submission/delete so updates appear within a minute

#### Staff entry portal
- [x] New `/staff/visitors` tab — desktop sidebar only, deliberately not in `StaffBottomNav` (already 4-slot)
- [x] Entry form: date (default today), category dropdown, count, optional note
- [x] Soft-confirm prompt above 1,000; hard cap at 10,000 per single entry — guards against fat-fingered zeros on public-facing numbers
- [x] Cumulative-totals strip at top of page (sanity-check before entering)
- [x] Recent-50 entries table; per-row delete button visible only to `super_admin`
- [x] Admin-only "Manage categories" expander — add/rename/toggle active

#### Database
- [x] `013_visitor_counts.sql` — `visitor_categories` (lookup) + `visitor_entries` (append-only log), RLS: public read, staff insert, admin delete/update/manage
- [x] `014_visitor_total_category.sql` — added a manual `total_visitors` category row (superseded by 015)
- [x] `015_visitor_activity_flag.sql` — added `is_activity` column, marked Events/Astrotours as activities, removed the now-obsolete `total_visitors` row (Total is computed, not entered)
- [x] All three migrations applied to production Supabase via SQL Editor

#### Deploy
- [x] Committed (`cb5e417`) and pushed to `origin/main` — Vercel auto-deployed
- [x] Verified live: hero number + breakdown render correctly

### Decisions Made
- **Append-only entry log** instead of a single-counter table — typos are reversible (delete the row) and the audit trail is free
- **Total = sum of people categories**, not a manually-entered figure — eliminates a drift class. The 5 people categories overlap (an international student is also a student) but Carl accepted the double-count: marketing-narrative value outweighs mathematical purity for a public dashboard
- **`is_activity` flag** to exclude Events/Astrotours from the total — they represent attendance instances, not unique visitors
- **Editable lookup table** for categories — admin can add new ones without a migration
- **`International Students` toggled inactive**, not deleted — preserves re-enable path
- **Mobile bottom nav left at 4-slot** — visitor-count entry is desk work, doesn't belong on the on-the-go bar
- **Hero hidden until total > 0** — avoids a giant "0" looking broken before baselines are entered

### Things flagged but deferred
- Auto-derive Events/Astrotours from existing `tickets` table — schema has `is_derived` flag reserved for this; switch later if manual entry drifts from real sales
- Per-card sparkline trend charts — deferred
- Day-one baseline entries — Carl to add via `/staff/visitors` (one entry per category with note "baseline")

### Files changed
- `src/app/page.tsx` (dashboard section + data fetch + `revalidate`)
- `src/app/staff/layout.tsx` (NAV_ITEMS extended with Visitors)
- `src/types/index.ts` (`VisitorCategory` + `VisitorEntry` types)
- `src/app/staff/visitors/{page,visitor-entry-form,actions,delete-entry-button,manage-categories}.tsx` (new)
- `src/components/visitor-stats/count-up.tsx` (new)
- `supabase/migrations/013_visitor_counts.sql` (new)
- `supabase/migrations/014_visitor_total_category.sql` (new — superseded)
- `supabase/migrations/015_visitor_activity_flag.sql` (new)

### Side notes
- Local `npm run build` fails on this machine — Turbopack tries to create Windows junction points on the G: drive, which the filesystem doesn't support. Vercel's Linux build is unaffected. Use `npx tsc --noEmit` + `npx eslint` for local verification.
- Got a Supabase auto-pause email for project `utmtlfipdwtwyrcqrflq` — that's an unrelated free-tier project on Carl's account, NOT SVU Booking (which is `neibpbkholgoypswyalx`). Worth deleting the unrelated project from the Supabase dashboard before the 90-day data-loss cutoff.

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only
- [ ] `/admin/maintenance` — placeholder only
- [ ] `/admin/tickets` search page — possible next session
- [ ] `agents/` directory — framework exists but no agents implemented
- [ ] `emails/` directory — no React Email templates built yet
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration
- [ ] Re-enable homepage "Get tickets" hero button (currently "Coming soon" `<span>`)
- [ ] Day-one baseline entries on `/staff/visitors` for each people category
- [ ] DMARC DNS record + Swinburne Exchange whitelist (carried from session 9)
- [ ] Pre-existing 25 lint errors across the codebase — not blocking deploys but worth a sweep someday

---

## Session 12 — 2026-05-01

### Completed

#### Notify-me signup on /events
- [x] Added `event_notify_subscribers` table (migration `019_event_notify_subscribers.sql`) — id, name, email (unique), source, created_at, updated_at, unsubscribed_at (reserved for future unsubscribe flow)
- [x] RLS: public-insert + public-update + staff-all (modeled on `enquiries`); applied to production Supabase via SQL Editor
- [x] Server action `src/app/events/actions.ts` — validates name + email, honeypot drop, idempotent upsert by email
- [x] Two Resend email helpers — `send-event-notify-welcome.ts` (subscriber confirmation) and `send-event-notify-admin-notification.ts` (dual-addressed to `cknox@swin.edu.au` + `carlknox@gmail.com`); both follow Session 8 conventions (text body + tags)
- [x] Client component `src/app/events/notify-me-card.tsx` — sky-blue glow card with pulsing dot, brand-tinted gradient, two diffused glow orbs, larger heading, two-tone "More sessions / coming soon" treatment
- [x] Card placed at the bottom of the events listing on `/events` (works for both populated + empty-state cases)
- [x] Type `EventNotifySubscriber` added to `src/types/index.ts`
- [x] Verified live end-to-end: row writes to DB, both emails arrive (gmail copy of admin notification confirmed; swin copy still blocked by Exchange filter — see below)

#### Bug fixes during session
- [x] `sr-only` Tailwind class wasn't being applied — honeypot label "Website (leave blank)" was rendering visibly. Replaced with explicit inline `position: absolute; left: -9999px` styles to guarantee hidden regardless of utility class compilation
- [x] Anon `.upsert()` was rejected with `42501 / new row violates row-level security policy` despite the public-insert policy having `WITH CHECK (true)` (identical to enquiry pattern, which works). Did not solve — switched to `createAdminClient()` (service-role) instead. Server-side action with input validation + honeypot, so bypassing RLS is safe here.

#### DMARC reporting investigation
- [x] Verified DMARC aggregate report from Microsoft (29 Apr → 30 Apr window): SPF, DKIM, DMARC all pass + align for `svu3d.ai` → `@swin.edu.au`. Disposition: `none`. Confirms the deliverability problem is content/reputation filtering at Exchange, NOT auth misconfiguration.
- [x] Carl emailed Swinburne IT to request whitelist — waiting for reply.

### Decisions Made
- **Notify-me capture-only MVP** — no admin UI, no broadcast composer, no double opt-in this round. Capture into a table; Carl reads via Supabase when it's time to announce. Single opt-in is fine under AU Spam Act when the form clearly states what they're signing up for.
- **Sky-blue accent (Tailwind `sky-400/500`) for the notify card** — deliberately off-brand vs the swin-red event cards above it, so the CTA visually separates from the list. The rest of the site stays red.
- **Service-role client for the action**, not anon — pragmatic given the unexplained RLS rejection. Still safe: server action, validated input, honeypot, no key exposure.
- **Heading kept as "More sessions"** despite copy genericizing to "SVU events" — flag for next session if it bugs anyone.

### Things flagged but deferred
- **The RLS rejection on `event_notify_subscribers`** — never root-caused. Same policy structure as `enquiries` works fine there. Worth running `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'event_notify_subscribers';` someday to compare actual stored policy text. Service-role bypass is durable enough that this is not blocking.
- **Unsubscribe flow** — `unsubscribed_at` column is in the schema; no `/unsubscribe` route built yet. Will be needed before any actual broadcast send.
- **Admin subscriber-list UI** — out of scope this round.

### Memory updated
- Added `swinburne_exchange_drops_svu3d.md` — durable note that "Delivered" in Resend ≠ arrived in inbox for `@swin.edu.au` recipients, so admin emails are dual-addressed to `carlknox@gmail.com` as workaround. Surfaces in MEMORY.md index.

### Files changed
- `supabase/migrations/019_event_notify_subscribers.sql` (new)
- `src/types/index.ts` (added `EventNotifySubscriber`)
- `src/lib/email/send-event-notify-welcome.ts` (new)
- `src/lib/email/send-event-notify-admin-notification.ts` (new)
- `src/app/events/actions.ts` (new)
- `src/app/events/notify-me-card.tsx` (new)
- `src/app/events/page.tsx` (1 import + card insertion)

### Commits
- `960cb64` feat: notify-me signup card on /events for future sessions
- `9e68725` debug: surface supabase error on notify signup + harden honeypot hiding
- `2e333b3` fix: notify-me signup uses admin client to bypass RLS quirk

### Remaining / Not Started
- [ ] `/admin/reports` — placeholder only
- [ ] `/admin/maintenance` — placeholder only
- [ ] `/admin/tickets` search page
- [ ] `/admin/subscribers` — list/CSV/broadcast composer for the notify-me list
- [ ] `/unsubscribe?token=…` route (column exists, route does not)
- [ ] `agents/` directory — no agents implemented
- [ ] `emails/` directory — no React Email templates
- [ ] SAML 2.0 SSO — blocked on Swinburne IT
- [ ] Conflict detection in `createBookingRequest`
- [ ] Google Calendar integration
- [ ] Re-enable homepage "Get tickets" hero button (still "Coming soon" `<span>`)
- [ ] Day-one baseline entries on `/staff/visitors`
- [ ] DMARC DNS record + Swinburne Exchange whitelist (Carl emailed IT 2026-05-01; waiting)
- [ ] Pre-existing 25 lint errors across the codebase
- [ ] Root-cause RLS rejection on `event_notify_subscribers` (deferred — service-role bypass works)

---

## Blockers & Open Questions

| Issue | Status | Notes |
|-------|--------|-------|
| Swinburne IT access for SAML config | Open | Need to contact IT to register SP and obtain IdP metadata |
| Email deliverability to swin.edu.au | Workaround in place | Swinburne Exchange silently drops emails from svu3d.ai. Gmail CC added as backup. Needs: DMARC DNS record + IT whitelist |
| DMARC DNS record | Blocked | GoDaddy rejects the TXT record — may need GoDaddy support or alternate syntax |
| Public ticketing | Live on Eventbrite | Buttons and `/events` remaining-ticket counts live in production (Session 10). `EVENTBRITE_PRIVATE_TOKEN` set in Vercel Production |
| Google Calendar service account | Open | Need to create service account and share ops calendar |
| Exact capacity of the SVU | Resolved | 80 per session confirmed |
| Cancellation policy details | Open | Define exact timeframes and refund rules per booking type |

---

## Architecture Decisions Log

| Decision | Chosen Approach | Alternative Considered | Reason |
|----------|----------------|------------------------|--------|
| Auth | Supabase Auth + SAML | NextAuth.js | Supabase native auth integrates better with RLS |
| DB | Supabase | PlanetScale / Neon | Supabase bundles auth + realtime + storage |
| Email | Resend | SendGrid / Postmark | Better DX, React Email support, modern API |
| UI components | shadcn/ui | Chakra UI / MUI | Tailwind-native, accessible, no vendor lock-in |
| Agent model | claude-sonnet-4-6 | claude-opus-4-6 | Better cost/performance balance for operational agents |
| QR codes | `qrcode` package | External QR service | Server-side, no external dependency for ticket generation |
| Public ticketing | Eventbrite (external) | Built-in Stripe checkout | New domain email deliverability issues — Eventbrite handles confirmations |
