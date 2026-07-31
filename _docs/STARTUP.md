# SVU_Booking — Session Startup Brief

> **Every AI agent session must begin by reading this file.**
> After reading this file, read any doc files listed under "Relevant Docs for This Session" before doing any work.

---

## Project Summary

**SVU_Booking** is a fully agentic AI-powered booking and ticketing platform for **Swinburne's Virtual Universe (SVU)** — a 100m² curved LED wall immersive facility at Swinburne University of Technology, Melbourne. The platform serves five user types (super admins, Swinburne staff, school groups, external hirers, and the general public) across six booking flows (academic teaching, school visits, public paid events, external hire, maintenance, and recurring bookings). Nine Claude-powered agents handle intake, scheduling, communications, payments, and reporting with minimal manual administration.

---

## Current Status

| Field | Value |
|-------|-------|
| **Phase** | Live in production — active development continuing |
| **Last Session** | Session 18 — 2026-07-31 |
| **Last Completed Task** | Published two "Worlds of the Solar System" (22 Aug) events linking to Eventbrite with live "X of 80 tickets left"; fixed the Eventbrite client to read event-level capacity + min price; swapped `EVENTBRITE_PRIVATE_TOKEN` to the owning organizer account; opened visitor-entry deletion to all staff (migration 022) |
| **Live site** | https://www.svu3d.ai/bookings/ |
| **Current Blockers** | SAML SSO blocked on Swinburne IT; Swinburne Exchange silently drops emails from `svu3d.ai`; DMARC DNS record pending |

---

## What's Built (quick reference)

- Public homepage: parallax hero, visitor-count dashboard, events sections
- `/events` — public events listing with live Eventbrite ticket counts; notify-me signup
- `/school-groups` — interest-registration form (sessions not yet built; collecting leads)
- `/enquire` — private hire enquiry form
- `/staff` — booking calendar, booking creation/editing, QR check-in, visitor counts
- `/admin` — full management panel: bookings, events, enquiries, check-in, users, broadcast, mailing list
- Supabase Auth (email/password), Resend email, Eventbrite API, Stripe (wired, not active for public tickets)

## What's NOT Built

- AI agents (framework exists; no agents implemented)
- React Email templates (inline HTML used instead)
- Conflict detection on booking requests
- Google Calendar integration
- SAML 2.0 SSO (blocked on Swinburne IT)
- School session content (page is in interest-collection mode)

---

## Next Steps

See [PROGRESS.md](PROGRESS.md) → Session 15 "Remaining / Not Started" for the current backlog.

---

## Knowledge Base Index

| File | Contents |
|------|---------|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Facility details, vision, goals, use cases, operator structure |
| [USER_ROLES.md](USER_ROLES.md) | 5 user roles, permissions matrix, auth methods, RLS summary |
| [BOOKING_FLOWS.md](BOOKING_FLOWS.md) | 6 end-to-end booking flows with edge cases and status reference |
| [AI_AGENTS.md](AI_AGENTS.md) | 9 Claude agents — tools, responsibilities, system prompts |
| [TECH_STACK.md](TECH_STACK.md) | Full stack decisions, rationale, local dev setup, env variables |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | All tables, RLS policies, indexes, relationship diagram |
| [INTEGRATIONS.md](INTEGRATIONS.md) | SSO, Stripe, Google Calendar, Resend, QR code implementation |
| [PROGRESS.md](PROGRESS.md) | Running build log — what's done, what's next, blockers, decisions |

---

## Key Decisions (Quick Reference)

| Area | Decision |
|------|----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + Realtime + RLS) |
| Auth | Supabase Auth + SAML 2.0 for Swinburne SSO |
| AI Model | `claude-sonnet-4-6` for all 9 agents |
| Payments | Stripe (Checkout + Invoices + Webhooks) |
| Email | Resend + React Email templates |
| Calendar | Google Calendar API (service account) + optional MS Graph |
| QR Codes | `qrcode` npm package — server-side, HMAC-signed tokens |
| Deployment | Vercel (planned — local development first) |

---

## Project Structure

```
~/Desktop/SVU_Booking/
├── _docs/           ← You are here — read before working
├── src/             ← Next.js application (to be initialised)
└── agents/          ← Claude agent TypeScript modules (to be built)
```

---

## How to Use This Project with AI Agents

1. Start every session by reading `STARTUP.md` (this file)
2. Read any referenced doc files relevant to the task at hand
3. Check `PROGRESS.md` for open questions and blockers before starting new work
4. After completing work, update `PROGRESS.md` with what was done and revised next steps
5. If a new architectural decision is made, add it to the "Architecture Decisions Log" in `PROGRESS.md`
6. If a key decision changes, update both `PROGRESS.md` and the relevant doc file

---

## Contact & Context

- **Facility**: Swinburne's Virtual Universe, Swinburne University of Technology, Hawthorn Campus, Melbourne
- **Operator**: Swinburne University (facility manager = Super Admin)
- **Dev approach**: Agentic AI-first, admin-light, full automation where possible
- **Target**: Production-ready platform serving academics, schools, public, and corporate hirers
