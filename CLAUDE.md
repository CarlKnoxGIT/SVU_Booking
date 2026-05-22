@AGENTS.md

# Project orientation

This is **SVU_Booking** — a booking, ticketing, and visitor-tracking platform for Swinburne's Virtual Universe (SVU), a 100m² curved LED wall facility at Swinburne University, Melbourne.

**Read `_docs/STARTUP.md` for current status, what's built, and open backlog before starting any work.**

## Key facts
- Live at `https://www.svu3d.ai/bookings/` (Vercel, auto-deploys from `main`)
- Database: Supabase project `neibpbkholgoypswyalx` (prod only — no staging DB)
- Migrations run manually via Supabase SQL Editor
- Public ticketing via Eventbrite (not built-in Stripe)
- All admin email notifications → `svu@swin.edu.au` + `cknox@swin.edu.au`
- School sessions not yet built — `/school-groups` is in interest-registration mode

## Doc index
| File | When to read |
|------|-------------|
| `_docs/STARTUP.md` | Start of every session — current state + backlog |
| `_docs/PROGRESS.md` | Full session history, decisions, blockers |
| `_docs/HANDOFF.md` | Takeover guide — accounts, gotchas, what works |
| `_docs/OPERATOR_GUIDE.md` | Day-to-day admin recipes |
| `_docs/BOOKING_FLOWS.md` | End-to-end booking flows |
| `_docs/USER_ROLES.md` | Roles, permissions, auth methods |
| `_docs/DATABASE_SCHEMA.md` | Tables, RLS policies, relationships |
| `_docs/TECH_STACK.md` | Stack decisions and rationale |
| `_docs/INTEGRATIONS.md` | Stripe, Eventbrite, Resend, QR, Calendar |
| `_docs/AI_AGENTS.md` | Agent design (aspirational — not yet implemented) |
