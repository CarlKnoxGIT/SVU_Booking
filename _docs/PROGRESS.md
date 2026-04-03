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

### Next Steps (Session 3)
- [ ] Create Supabase project at supabase.com
- [ ] Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor
- [ ] Fill in `.env.local` with Supabase URL + anon key + service role key
- [ ] Set up Supabase Auth providers (Google OAuth + email magic link)
- [ ] Begin SAML 2.0 SSO config (contact Swinburne IT)
- [ ] Install shadcn/ui and build shared layout components (navbar, sidebar)
- [ ] Build admin dashboard skeleton (`/admin`)
- [ ] Build staff booking flow (`/staff/book`)

---

## Blockers & Open Questions

| Issue | Status | Notes |
|-------|--------|-------|
| Swinburne IT access for SAML config | Open | Need to contact IT to register SP and obtain IdP metadata |
| Sending domain verification (Resend) | Open | Need DNS access for `svu.swinburne.edu.au` |
| Google Calendar service account | Open | Need to create service account and share ops calendar |
| Stripe account setup | Open | Need to determine if using personal account or Swinburne merchant account |
| Exact capacity of the SVU | Open | Confirm exact max attendee count for each booking type |
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
