# SVU_Booking — AI Agents

## Overview

The system uses nine Claude-powered agents, all using `claude-sonnet-4-6` via the Anthropic API with tool use. Agents are defined in the `agents/` directory as TypeScript modules. The **Orchestrator Agent** is the entry point — it receives all incoming requests and routes them to the appropriate specialist agent.

All agents follow the same base pattern:
- Accept a structured `context` object (user, action, data)
- Use defined tools to interact with the database, external APIs, or other agents
- Return a structured `AgentResult` object with action taken, next steps, and any communications queued

---

## Agent Definitions

### 1. Orchestrator Agent
**File**: `agents/orchestrator.ts`
**Role**: Routes incoming requests to the correct specialist agent based on intent classification.

**Tools**:
- All other agent invocation tools
- User session context reader
- Intent classifier (LLM-based)

**Responsibilities**:
- Receive webhook events, form submissions, and API calls
- Classify the intent (booking request type, user role, urgency)
- Delegate to the appropriate specialist agent
- Aggregate results and trigger follow-up agent calls as needed

**System Prompt Excerpt**:
> You are the central coordinator for the Swinburne Virtual Universe booking platform. Classify incoming requests by booking type and user role, then delegate to the appropriate specialist agent. Always confirm the action taken and whether human review is required.

---

### 2. Intake Agent
**File**: `agents/intake.ts`
**Role**: Processes school/group request forms and external hire enquiries. Validates completeness, extracts key data, flags issues.

**Tools**:
- `read_form_submission(id)` — fetch raw form data
- `validate_form(data, schema)` — check required fields
- `send_email(to, template, data)` — request clarification
- `create_booking_request(data)` — write to DB

**Responsibilities**:
- Validate that all required information is present
- Extract structured data from free-text fields
- Flag incomplete or ambiguous submissions
- Send follow-up emails when clarification is needed
- Create initial `pending` booking record in DB
- Hand off to Booking Agent once validated

**System Prompt Excerpt**:
> You are the intake specialist for the SVU booking system. Review incoming booking requests for completeness and accuracy. If any required information is missing or unclear, draft a polite follow-up email to the requester. Once satisfied, create a validated booking record and pass it to the Booking Agent.

---

### 3. Booking Agent
**File**: `agents/booking.ts`
**Role**: Checks availability, resolves conflicts, confirms or rejects bookings, generates quotes for external hire.

**Tools**:
- `check_availability(date_range, duration)` — query slots table
- `create_booking(data)` — write confirmed booking to DB
- `update_booking_status(id, status)` — update booking record
- `generate_quote(booking_data, pricing_config)` — calculate hire costs
- `get_pricing_config()` — fetch current pricing tiers

**Responsibilities**:
- Check real-time availability for requested slots
- Detect and report conflicts
- Auto-approve conflict-free academic bookings
- Generate itemised quotes for external hire
- Propose alternative slots when requested time is unavailable
- Update booking status through the workflow

**System Prompt Excerpt**:
> You are the booking specialist for the SVU. When given a validated booking request, check availability and either confirm the booking or propose alternatives. For external hire requests, generate a professional, itemised quote based on current pricing. Always be clear about what is confirmed vs. proposed.

---

### 4. Scheduler Agent
**File**: `agents/scheduler.ts`
**Role**: Manages the master facility calendar, handles recurring bookings, blocks maintenance windows, prevents double-booking.

**Tools**:
- `get_calendar(date_range)` — fetch all slots and bookings
- `block_slot(slot_id, reason)` — mark slot as blocked
- `create_recurring_series(pattern)` — generate recurring booking instances
- `detect_conflicts(slots[])` — check for overlaps
- `sync_google_calendar(event)` — push to Google Calendar
- `sync_ms_calendar(event)` — push to Outlook Calendar

**Responsibilities**:
- Maintain the authoritative facility schedule
- Generate all instances for recurring bookings
- Run conflict detection across any proposed set of slots
- Proactively alert on emerging conflicts (e.g., maintenance added to a booked slot)
- Sync confirmed bookings to Google/MS Calendar

---

### 5. Communications Agent
**File**: `agents/communications.ts`
**Role**: Sends all outbound communications — confirmation emails, reminders, QR tickets, calendar invites.

**Tools**:
- `send_email(to, template, data)` — Resend API
- `generate_qr_code(data)` — create QR PNG
- `send_calendar_invite(event, attendees)` — iCal / Google Calendar
- `log_notification(booking_id, type, status)` — write to notifications table
- `get_email_template(name)` — fetch template from DB or file

**Responsibilities**:
- Send booking confirmations, rejections, and updates
- Generate and attach QR-coded e-tickets for public events
- Send pre-event reminder emails (configurable: 24h, 1h before)
- Send calendar invites for academic and school bookings
- Log all sent communications to the notifications table

**Email Templates**:
- `booking_confirmed` — for all booking types
- `booking_rejected` — with reason and alternatives
- `ticket_purchase` — with QR code attachment
- `payment_reminder` — for unpaid hire invoices
- `event_reminder_24h` / `event_reminder_1h`
- `maintenance_conflict_notice` — for affected bookings
- `quote_proposal` — for external hire

---

### 6. Payments Agent
**File**: `agents/payments.ts`
**Role**: Handles Stripe checkout sessions, invoices, refunds, and payment status tracking.

**Tools**:
- `create_checkout_session(items, metadata)` — Stripe checkout
- `create_payment_link(amount, metadata)` — Stripe payment link
- `create_invoice(customer, line_items)` — Stripe invoice
- `process_refund(payment_intent_id, amount)` — Stripe refund
- `get_payment_status(booking_id)` — DB + Stripe lookup
- `handle_webhook(event)` — process Stripe webhook events

**Responsibilities**:
- Create Stripe checkout sessions for public ticket purchases
- Generate payment links or invoices for external hire
- Listen for and process Stripe webhook events (payment confirmed, failed, refunded)
- Update booking status on payment confirmation
- Process refunds within policy rules
- Log all payment records to the `payments` table

---

### 7. Public Events Agent
**File**: `agents/public-events.ts`
**Role**: Manages public event listings, ticket inventory, and waitlists.

**Tools**:
- `create_event(data)` — write to events table
- `update_event(id, data)` — update event details
- `get_event_availability(id)` — check ticket inventory
- `add_to_waitlist(event_id, user_id)` — manage waitlist
- `notify_waitlist(event_id)` — alert waitlisted users when tickets available
- `publish_event(id)` / `unpublish_event(id)` — control visibility

**Responsibilities**:
- Publish and manage public event listings on the portal
- Track ticket inventory and sold counts
- Automatically open a waitlist when events reach capacity
- Notify waitlisted users when tickets become available (e.g., cancellation)
- Unpublish events that are cancelled or past

---

### 8. Maintenance Agent
**File**: `agents/maintenance.ts`
**Role**: Tracks maintenance windows, flags conflicts with existing bookings, notifies the operations team.

**Tools**:
- `create_maintenance_window(data)` — write to maintenance_windows table
- `check_maintenance_conflicts(window)` — find affected bookings
- `notify_affected_bookings(window_id)` — trigger Communications Agent
- `get_upcoming_maintenance()` — list scheduled windows
- `resolve_conflict(booking_id, resolution)` — reschedule or cancel

**Responsibilities**:
- Log and track all planned and emergency maintenance windows
- Immediately flag any existing confirmed bookings that conflict
- Coordinate with Communications Agent to notify affected users
- Recommend resolution options (reschedule vs. cancel)
- Ensure maintenance windows are properly blocked in the calendar

---

### 9. Reporting Agent
**File**: `agents/reporting.ts`
**Role**: Generates utilisation reports, revenue summaries, and booking analytics for Super Admins.

**Tools**:
- `query_bookings(filters)` — DB aggregation queries
- `generate_utilisation_report(period)` — % of slots used
- `generate_revenue_report(period)` — income by booking type
- `generate_booking_breakdown(period)` — bookings by type/role
- `export_csv(data)` — download as CSV
- `render_chart(data, type)` — generate chart image

**Responsibilities**:
- Produce weekly/monthly/annual utilisation summaries
- Break down revenue by booking type (hire, tickets, academic)
- Identify peak usage periods and idle slots
- Surface trends in booking types and user demographics
- Export data to CSV for external reporting

---

## Agent Architecture Notes

- All agents are implemented as TypeScript modules in `agents/`
- Agents communicate via the **Orchestrator** — they do not call each other directly (except where noted)
- Every agent action is logged to an `agent_actions` table (future implementation)
- Agents can request human review by setting `requires_human_review: true` in their result
- The Orchestrator polls for pending human-review items and surfaces them in the Admin dashboard
- Model: `claude-sonnet-4-6` for all agents (balance of capability and cost)
- Tool definitions follow the Anthropic tool use API format
