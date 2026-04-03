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
| **Phase** | Phase 1 complete — Project setup & architecture documentation |
| **Last Session** | Session 1 — 2026-04-03 |
| **Last Completed Task** | Created full `_docs/` knowledge base (all 9 files) |
| **Current Blockers** | Awaiting Swinburne IT contact for SAML SSO setup; Stripe account TBD |

---

## Next Steps (Start Here)

1. **Initialise Next.js 14 app** in `src/` directory with TypeScript + Tailwind
2. **Install dependencies**: `@supabase/ssr`, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `stripe`, `resend`, `qrcode`, `shadcn/ui`, `react-email`
3. **Create Supabase project** and run initial schema migrations (see `DATABASE_SCHEMA.md`)
4. **Set up Supabase Auth** — enable email, Google OAuth, and SAML 2.0 providers
5. **Build auth middleware** — role detection, protected routes, redirect logic
6. **Create app layout** — navigation, sidebar structure for admin vs. staff vs. public views

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
