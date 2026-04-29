# SVU Booking — Operator Guide

> Day-to-day recipes for running the SVU Booking site. Read [HANDOFF.md](HANDOFF.md) first.

---

## Your URLs

- **Staff portal:** https://www.svu3d.ai/bookings/staff
- **Admin portal:** https://www.svu3d.ai/bookings/admin (super_admin role required)
- **Public homepage:** https://www.svu3d.ai/bookings/

Bookmark all three.

---

## Logging in

1. Go to https://www.svu3d.ai/bookings/login
2. Enter your `@swin.edu.au` email + password.
3. If you've never logged in before, ask the existing super_admin to invite you via `/bookings/admin/users` → **Invite staff**. You'll get an email with a magic link to set your password.

If you don't see the email, **check your Junk folder** — Swinburne Exchange routes emails from `bookings@svu3d.ai` to spam. Mark it "Not Junk" and add `bookings@svu3d.ai` to your Safe Senders.

---

## Daily checklist

Five-minute round each morning:

| Step | Where | What you're looking for |
|------|-------|-------------------------|
| 1. New booking requests | `/bookings/admin` → Bookings calendar | Pending bookings (yellow). Click → Approve / Reject / Edit |
| 2. New enquiries | `/bookings/admin` → Enquiries section | Cards marked "new". Reply via the email link, then change status to "in_progress" or "closed" |
| 3. Staff access requests | `/bookings/admin` → Staff Requests section | Approve genuine Swinburne staff; reject spam |
| 4. Visitor counts (post-event) | `/bookings/staff/visitors` | Add yesterday's tally per category |

---

## Recipe: approve / reject a booking

1. Open `/bookings/admin`.
2. The booking calendar at the top shows the current week. Pending bookings appear in yellow.
3. Click a pending booking — a panel slides out.
4. **Approve** to confirm and notify the requester.
   **Reject** to decline (provide a reason — it goes into the email).
   **Edit** to adjust time/title before approving.
5. The requester gets an email automatically.

Bulk approve multiple at once: shift-click to multi-select, then use the bulk action bar at the bottom.

---

## Recipe: create a new public event (Eventbrite-backed)

The site lists events but the actual ticket sales happen on Eventbrite.

1. **Create the Eventbrite event first** — login at https://www.eventbrite.com.au, create the event with all the details (date, time, capacity, ticket price), publish it, copy the public URL.
2. In the SVU site, go to `/bookings/admin/events` → **New event**.
3. Fill in the form. **The Eventbrite URL goes into the field labelled "Humanitix URL"** (the field name is legacy — same field, despite the label). The button on the public site will link there.
4. Set "Publish immediately" if you want it live, or save as draft.
5. The "Get tickets" button on the public events page will link to your Eventbrite page. The site automatically pulls live ticket-availability counts every minute via the Eventbrite API.

---

## Recipe: event check-in on the day

1. Sign in on a phone or tablet at `/bookings/staff/checkin`.
2. Tap **Start scan** — allow camera access.
3. Aim at the QR code on the visitor's ticket (printed or on their phone).
4. The result card shows their name, ticket count, event session, and whether they've already been scanned.
5. The tally bar at the bottom shows live progress (e.g. `42 in / 80 sold · 53%`).
6. Tap **Scan next ticket** to keep going.

If a guest can't find their ticket, look them up by code in `/bookings/admin` → Check-in section (manual code entry).

---

## Recipe: log visitor counts (after a session)

1. Go to `/bookings/staff/visitors`.
2. Form fields: Date (defaults to today), Category, Count, optional Note.
3. Submit — the public homepage **By the numbers** dashboard updates within ~60 seconds.

**Heads-up:**
- Counts above 1,000 trigger a confirmation prompt — that's intentional, to catch typos.
- Max per single entry is 10,000. If you had a bigger session, split it into multiple entries.
- The cumulative-totals strip at the top of the page shows what you're adding to.
- The hero "Total Visitors" number on the public page is auto-summed from the active people-categories. You don't enter it manually.

---

## Recipe: fix a visitor-count typo

If a staff member entered the wrong number:

1. Go to `/bookings/staff/visitors`.
2. Scroll to **Recent entries** table.
3. Click **Delete** on the bad row (only super_admin sees this button).
4. Add a new correct entry via the form above.

For audit reasons we delete-and-re-add rather than edit in place.

---

## Recipe: add or rename a visitor category

Only super_admin can do this.

1. `/bookings/staff/visitors` → scroll to bottom.
2. Expand **Manage categories**.
3. To **add**: fill in Label, Slug (lowercase, no spaces), Sort order (e.g. 25 to put it between Students at 10 and VIP at 30). Click **Add category**.
4. To **hide** (without deleting): untick the **Active** checkbox next to it. Reversible — tick it again to restore.
5. To **delete entirely**: do it from the Supabase Table Editor (visitor_categories table). This cascades — any entries in that category go too.

---

## Recipe: send a broadcast email to staff

1. `/bookings/admin` → scroll to **Broadcast** section.
2. Pick a date range — the system finds all staff with confirmed bookings in that window.
3. Compose subject + message.
4. Send. Each recipient gets a personalised email.

Note: emails to `@swin.edu.au` may go to Junk (see top of this doc).

---

## Recipe: download a guest list / attendance report

1. `/bookings/admin` → **Events** section.
2. Find the event row.
3. Click **Guest list** to download a CSV of all ticket buyers.
4. For across-events attendance: use the URL `https://www.svu3d.ai/bookings/api/admin/reports/attendance` (returns CSV). You must be logged in as super_admin.

---

## Recipe: someone needs a ticket re-sent

If a guest lost their confirmation email:

1. **For Eventbrite events** (the current default): direct them to https://www.eventbrite.com.au/o/your-account → "My tickets". Eventbrite handles all guest comms.
2. **For internal-checkout events** (rare/legacy): look up the ticket in Supabase Table Editor → `tickets` table → find their email or code → forward the original email manually, or have a developer re-send programmatically.

---

## Recipe: temporarily block out the SVU for maintenance

1. `/bookings/admin` → bookings calendar.
2. Click **Block dates** in the calendar toolbar.
3. Pick the date range and reason.
4. Each day in the range gets a confirmed booking with type "maintenance" — they show on the calendar in a different colour.

This prevents staff from booking those slots.

---

## When something looks broken

| Symptom | First thing to try |
|---------|-------------------|
| Page 404 on `/staff` or `/admin` | Add `/bookings` to the URL — production basePath is `/bookings/...` |
| "By the numbers" dashboard shows old data | Wait 60 seconds and reload — the homepage caches for a minute |
| Email didn't arrive | Check Junk folder. Then the Resend dashboard for delivery status |
| Eventbrite ticket counts on `/events` look wrong | They cache 60s. If still wrong after that, the Eventbrite API token may have expired — ask the developer |
| Can't log in | Use the **Forgot password** link on `/login`. Also check Junk for the reset email |
| Calendar isn't showing a booking that should be there | Hard refresh (Ctrl+Shift+R). Check the booking's `status` in Supabase — `cancelled` bookings are hidden |

If something's properly broken, escalate to whoever inherited the developer side of the project.

---

## Periodic tasks

| Cadence | Task |
|---------|------|
| Daily | Check enquiries, booking requests, visitor counts entry |
| Weekly | Review staff access requests, check Eventbrite for upcoming-event ticket sales |
| Per-event | Set up Eventbrite, create event in admin, do check-in on the day, log visitor counts after |
| Quarterly | Review user list (`/bookings/admin/users`), revoke access for departed staff |
| As-needed | Update visitor categories on the dashboard (add/hide as the SVU's audience evolves) |
