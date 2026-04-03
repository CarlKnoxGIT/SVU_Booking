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
| **Phase** | Phase 2 in progress — App foundation built, DB live |
| **Last Session** | Session 3 — 2026-04-03 |
| **Last Completed Task** | Supabase DB live, `.env.local` configured, homepage running at localhost:3000 |
| **Current Blockers** | Awaiting Swinburne IT contact for SAML SSO setup; Stripe account TBD |

---

## Next Steps (Start Here)

1. **Set up Supabase Auth providers** — enable Google OAuth + email magic link in Supabase dashboard
2. **Build login page** (`/login`) — unified entry point for all user types
3. **Build admin dashboard skeleton** (`/admin`) — bookings overview, approvals queue
4. **Build staff booking flow** (`/staff/book`) — slot browser + booking form
5. **Install shadcn/ui** — component library for consistent UI
6. **Begin SAML 2.0 SSO config** — contact Swinburne IT for IdP metadata

See [PROGRESS.md](PROGRESS.md) for the full session log and open questions.

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
