# SVU_Booking — Booking Flows

## Overview

Six distinct booking flows serve the different user communities. Each flow is partially or fully handled by AI agents. All flows write to the same `bookings` and `slots` tables with appropriate `booking_type` and `status` values.

---

## Flow 1: Academic Teaching Booking

**User**: Swinburne Staff / Academic
**Auth**: Swinburne SSO

### Steps
1. Staff authenticates via Swinburne SSO
2. Browses the availability calendar (shows available slots, own bookings)
3. Selects a timeslot and provides booking metadata:
   - Purpose (lecture / tutorial / research / demonstration)
   - Estimated attendee count
   - Any AV/technical requirements
4. **Booking Agent** checks for conflicts in real time
5. If no conflict → booking **auto-approved** → status set to `confirmed`
6. **Communications Agent** sends:
   - Email confirmation to staff member
   - Google/Outlook calendar invite
7. Slot locked in master calendar

### Edge Cases
- Conflict detected → staff offered alternative slots
- Conflict with existing lower-priority booking → Super Admin notified to arbitrate

---

## Flow 2: School Group / Education Outreach Request

**User**: School / Education Contact
**Auth**: Email-verified account

### Steps
1. Teacher registers/logs in
2. Fills in structured **request form**:
   - School name, suburb, contact details
   - Group size, year level(s), subject/curriculum link
   - Preferred date range (not a specific slot)
   - Accessibility requirements
   - Any specific content/experience requested
3. **Intake Agent** receives the form submission:
   - Validates completeness
   - Flags missing or ambiguous information
   - Extracts preferred date range and constraints
4. **Scheduling Agent** checks availability within requested range, proposes 2–3 options
5. Super Admin receives notification with AI-prepared summary and proposed slots
6. Admin confirms or modifies slot selection
7. **Communications Agent** emails teacher with:
   - Proposed slot(s)
   - Instructions to confirm or request alternative
8. Teacher confirms → booking status → `confirmed`
9. Confirmation email + calendar invite sent to teacher

### Edge Cases
- No availability in requested range → AI proposes alternatives and explains options to teacher
- Missing info on form → Intake Agent sends follow-up email requesting clarification

---

## Flow 3: Public Paid Event

**User**: General Public (tickets); Super Admin (event creation)
**Auth**: Public — social login or email magic link

### Steps (Admin side — Event Creation)
1. Super Admin creates a new public event:
   - Title, description, date/time, duration
   - Ticket price, max capacity
   - Event type (film screening / interactive / educational / etc.)
2. **Public Events Agent** publishes event to the public portal
3. Slot blocked in master calendar

### Steps (Public side — Ticket Purchase)
1. Visitor browses public events on the portal (no login required)
2. Selects event → clicks "Get Tickets"
3. Prompted to log in or continue as guest (email capture)
4. Selects ticket quantity
5. **Payments Agent** creates Stripe checkout session
6. Visitor completes payment via Stripe
7. Stripe webhook confirms payment → booking status → `confirmed`
8. **Communications Agent** sends:
   - Order confirmation email with QR-coded e-ticket (PNG attachment)
   - Event details and venue information
9. At event: QR code scanned at entry

### Edge Cases
- Event sells out → waitlist opens automatically
- Payment fails → user notified, slot not reserved
- Refund requested → **Payments Agent** processes via Stripe refund API

---

## Flow 4: External Hire

**User**: External Hirer / Event Organiser
**Auth**: Self-registered account

### Steps
1. Hirer registers and submits **hire enquiry form**:
   - Organisation name, contact details
   - Event type and description
   - Date preferences and duration
   - Expected attendee count
   - Technical requirements (custom content, 3D, audio needs)
   - Budget range (optional)
2. **Intake Agent** validates enquiry and extracts key parameters
3. **Booking Agent** checks availability for requested dates
4. **Booking Agent** generates a **quote** including:
   - Room hire rate (from pricing config)
   - Technical setup fees
   - Optional add-ons
   - Terms and cancellation policy
5. Quote emailed to hirer; copy to Super Admin
6. Hirer reviews quote:
   - **Accepts** → proceeds to payment
   - **Requests changes** → back to Booking Agent for revised quote
   - **Declines** → enquiry closed
7. **Payments Agent** creates Stripe payment link or invoice
8. Payment confirmed → booking status → `confirmed`
9. **Communications Agent** sends:
   - Booking confirmation
   - Facility access instructions
   - Pre-event checklist
10. Slot blocked in master calendar

---

## Flow 5: Maintenance Session

**User**: Maintenance Team (internal)
**Auth**: Swinburne SSO (staff role)

### Steps
1. Maintenance team member (or Super Admin) logs a maintenance window:
   - Date, start time, end time
   - Type: routine / emergency / calibration / installation
   - Notes
2. **Maintenance Agent** checks for conflicting confirmed bookings
3. If conflict exists:
   - Super Admin alerted immediately
   - Affected booking holders notified with explanation and options (reschedule or cancel)
4. Maintenance window status → `scheduled`
5. Slot marked as `blocked` in master calendar
6. **Scheduler Agent** prevents new bookings from being made in this window

### Edge Cases
- Emergency maintenance → immediate block + urgent notification to all affected parties
- Routine maintenance during low-demand periods → auto-approved, ops team notified

---

## Flow 6: Recurring Block Booking

**User**: External Hirer or Swinburne Staff
**Auth**: Appropriate to user type

### Steps
1. User or admin sets up a recurring booking:
   - Start date, end date (or number of occurrences)
   - Recurrence pattern: weekly / bi-weekly / monthly
   - Day of week, time, duration
2. **Scheduler Agent** generates all individual slot instances
3. Conflict check run across all instances:
   - Clean series → all instances confirmed
   - Conflicts on specific dates → flagged for human review
4. Super Admin reviews and approves the recurring series
5. **Communications Agent** sends recurring booking confirmation with all dates listed
6. Individual calendar invites sent for each occurrence (or a recurring series invite)
7. **Scheduler Agent** monitors for future conflicts and alerts proactively

### Edge Cases
- Mid-series conflict (e.g. maintenance added later) → affected instance flagged, hirer notified
- Hirer wants to cancel one instance vs. full series → handled separately in UI

---

## Booking Status Reference

| Status | Meaning |
|--------|---------|
| `pending` | Request submitted, awaiting review |
| `proposed` | AI has generated a quote or slot proposal |
| `confirmed` | Booking locked in, all parties notified |
| `cancelled` | Cancelled by user or admin |
| `completed` | Event has taken place |
| `blocked` | Maintenance or admin-blocked slot |
| `waitlisted` | Event full, user on waitlist |
