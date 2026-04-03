# SVU_Booking — User Roles & Permissions

## Role Summary

| Role | Description | Authentication |
|------|-------------|----------------|
| **Super Admin** | Full system control; facility manager(s) | Swinburne SSO (SAML 2.0) |
| **Swinburne Staff / Academic** | Book for teaching, research, internal use | Swinburne SSO (SAML 2.0) |
| **School / Education Contact** | Submit group booking request forms | Email-verified account |
| **External Hirer** | Hire space for paid events/corporate use | Self-registered account |
| **General Public** | Purchase tickets to public sessions | Social login / email magic link |

---

## Role Details

### 1. Super Admin
**Who**: Facility managers, SVU operations leads at Swinburne
**Auth**: Swinburne SSO — role assigned in user table on first login
**Permissions**:
- View, create, edit, cancel any booking
- Create and manage public events
- Approve or reject all booking requests
- Set pricing for external hire and public tickets
- Access all reporting and analytics
- Manage maintenance windows
- Manage user accounts and roles
- Configure system settings (opening hours, slot durations, pricing tiers)
- Override AI agent decisions

---

### 2. Swinburne Staff / Academic
**Who**: Academics, researchers, professional staff at Swinburne
**Auth**: Swinburne SSO — auto-recognised by `@swinburne.edu.au` email domain
**Permissions**:
- Browse available slots
- Create booking requests for teaching/research
- Auto-approved if no conflict (configurable)
- Receive calendar invites and confirmations
- Cancel own bookings (within cancellation window)
- View own booking history

---

### 3. School / Education Contact
**Who**: Teachers, school administrators, education program coordinators
**Auth**: Email-verified account (self-registered with school email)
**Permissions**:
- Submit group booking request forms
- Provide group details (size, year level, subject area, accessibility needs)
- Receive status updates on their request
- Confirm or decline a proposed booking slot
- View and manage their upcoming bookings
- Cancel bookings (subject to cancellation policy)

---

### 4. External Hirer / Event Organiser
**Who**: Companies, external organisations, event producers
**Auth**: Self-registered account (email + password or social)
**Permissions**:
- Submit hire enquiry with event details and requirements
- Receive AI-generated quote
- Approve quote and proceed to payment
- Receive booking confirmation, invoice, and facility access details
- Cancel/reschedule (subject to hire agreement terms)
- View own booking history and invoices

---

### 5. General Public
**Who**: Members of the public attending ticketed SVU events
**Auth**: Social login (Google) or email magic link
**Permissions**:
- Browse upcoming public events
- Purchase tickets via Stripe checkout
- Receive QR-coded e-ticket by email
- View own ticket history
- Request refunds (within policy)

---

## Permissions Matrix

| Action | Super Admin | Staff/Academic | School | External Hirer | Public |
|--------|:-----------:|:--------------:|:------:|:--------------:|:------:|
| View public events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Purchase public tickets | ✓ | ✓ | — | — | ✓ |
| Create academic booking | ✓ | ✓ | — | — | — |
| Submit school request | ✓ | — | ✓ | — | — |
| Submit hire enquiry | ✓ | — | — | ✓ | — |
| Approve/reject bookings | ✓ | — | — | — | — |
| Create public events | ✓ | — | — | — | — |
| Manage maintenance | ✓ | — | — | — | — |
| View all bookings | ✓ | — | — | — | — |
| Access reports | ✓ | — | — | — | — |
| Manage users | ✓ | — | — | — | — |

---

## Row Level Security (RLS) Summary

All roles are enforced at the database level via Supabase RLS policies:
- Users can only read/write their own records unless Super Admin
- Bookings are visible to the booking owner + Super Admin + relevant AI agents
- Public events are readable by all authenticated and anonymous users
- Maintenance windows are visible only to Super Admin and Staff roles

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for full RLS policy definitions.
