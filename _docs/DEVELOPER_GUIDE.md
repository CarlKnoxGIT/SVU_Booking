# SVU Booking — Developer Guide

> Onboarding for a developer continuing the build. Read [HANDOFF.md](HANDOFF.md) first.

---

## TL;DR — what you need

| | |
|---|---|
| **Repo** | https://github.com/CarlKnoxGIT/SVU_Booking |
| **Node** | v24 (project was built with v24 via nvm) |
| **Framework** | Next.js 16.2.2, App Router, **TypeScript strict** |
| **DB** | Supabase project `neibpbkholgoypswyalx` (single project for dev + prod) |
| **Hosting** | Vercel — auto-deploys on push to `main` |
| **Domain DNS** | GoDaddy (`svu3d.ai` zone) |
| **Email** | Resend (sender domain: `bookings@svu3d.ai`) |
| **Public ticketing** | Eventbrite (URLs stored in `events.humanitix_url`) |

---

## Quirks you'll hit in the first day

1. **Production basePath is `/bookings`.** Set via `NEXT_PUBLIC_BASE_PATH` in Vercel env vars. Local dev runs without it. All `<Link>` components and server-side redirects work correctly because Next.js applies the basePath automatically — but **`fetch()` calls to your own API routes must prefix with `process.env.NEXT_PUBLIC_BASE_PATH ?? ''`** or they'll 404 in prod. Grep the codebase for examples.

2. **Next.js 16 renamed `middleware.ts` to `proxy.ts`.** The exported function must be named `proxy`, not `middleware`. See `src/proxy.ts`. This is a project-specific upgrade; most online tutorials still say `middleware`.

3. **shadcn/ui in this project uses Base UI buttons, not Radix.** The `asChild` prop is **not** supported. Use `buttonVariants()` + `<Link>` for navigation buttons instead.

4. **`useActionState` requires `(prevState, formData)` signature.** Even if you don't use prevState, type it as `_prevState: State`.

5. **There's a single Supabase project for dev and prod.** Don't break production by experimenting in the SQL editor. If you need an isolated playground, create a separate Supabase project and point your local `.env.local` at it.

6. **Direct push to `main` is the workflow.** Vercel auto-deploys. There's no PR review. If you want CI gates, add them.

7. **Local `npm run build` may fail on Windows G:-drive systems** (Turbopack tries to create junction points the filesystem doesn't support). Vercel's Linux build is fine. Use `npx tsc --noEmit` and `npx eslint <paths>` for local verification.

---

## Local setup

### Prerequisites
- Node v24 (use `nvm install 24` then `nvm use 24`)
- A `.env.local` file (Carl can share via secure channel — do not commit it)

### Steps

```bash
# 1. Clone
git clone https://github.com/CarlKnoxGIT/SVU_Booking.git
cd SVU_Booking

# 2. Install
npm install

# 3. Add .env.local (see .env.example for the keys, ask Carl for values)

# 4. Run
npm run dev
```

Open http://localhost:3000. (Note: no `/bookings` prefix locally because the env var isn't set.)

To verify changes before pushing:
```bash
npx tsc --noEmit                    # type-check
npx eslint src/<path-to-changed>    # lint just your changes
```

If you need to test against production data, the same Supabase project serves both — local dev reads/writes the same DB. Be careful.

---

## Project structure (high-level)

```
src/
├── app/
│   ├── page.tsx                    # Public homepage (hero, dashboard, sections)
│   ├── (public routes)/            # /events, /school-groups, /enquire, /login, /tickets/cancel
│   ├── auth/                       # Auth callback + email confirmation
│   ├── staff/                      # Authenticated staff portal
│   │   ├── layout.tsx              # Auth guard, sidebar nav
│   │   ├── page.tsx                # Calendar (main staff view)
│   │   ├── book/                   # Booking creation/edit
│   │   ├── checkin/                # QR scanner
│   │   ├── visitors/               # Visitor counts entry
│   │   └── profile/                # Profile settings
│   ├── admin/                      # Super-admin only
│   │   ├── layout.tsx              # super_admin role guard
│   │   ├── page.tsx                # Single-page dashboard (anchored sections)
│   │   ├── bookings/               # Calendar + admin actions
│   │   ├── events/                 # Events CRUD
│   │   ├── enquiries/              # Enquiry triage
│   │   ├── checkin/                # Admin check-in (reuses staff scanner)
│   │   ├── users/                  # Role management
│   │   ├── broadcast/              # Email broadcast
│   │   └── staff-requests/         # Approve/reject staff access
│   └── api/                        # API routes
│       ├── checkout/               # Stripe checkout (legacy/dormant)
│       ├── reserve/                # Free-ticket reservation
│       ├── qr/[code]/              # QR lookup for check-in
│       ├── tickets/cancel/         # Customer-initiated cancellation
│       ├── cron/                   # Scheduled jobs (booking-reminders)
│       ├── webhooks/stripe/        # Stripe webhook handler
│       └── admin/                  # Admin-only API routes (reports, guest lists)
├── components/                     # Shared UI
│   ├── ui/                         # shadcn/Base UI primitives (Button, Input, etc.)
│   ├── visitor-stats/              # Dashboard count-up component
│   └── (others)                    # Parallax hero, Saturn animation, sidebars
├── lib/
│   ├── supabase/                   # SSR + browser + admin clients
│   ├── anthropic/                  # Agent runner framework (no agents wired)
│   ├── stripe/                     # Stripe client
│   ├── resend/                     # Resend client
│   ├── eventbrite/                 # Eventbrite ticket-availability fetcher
│   └── email/                      # Email sender helpers
├── proxy.ts                        # Auth + role guards (replaces middleware.ts)
└── types/index.ts                  # All shared TypeScript types
```

---

## Database

### Where the schema lives
- **Source of truth:** `supabase/migrations/*.sql`. Each file is run manually in the Supabase Dashboard SQL Editor (no CLI).
- **Type definitions:** `src/types/index.ts`. Keep in sync with schema.
- **Reference doc:** `_docs/DATABASE_SCHEMA.md` (may lag behind migrations — verify against the actual DB if in doubt).

### Adding a new migration

1. Create `supabase/migrations/0NN_my_change.sql` (next available number, lowercase snake_case description).
2. Use the existing patterns:
   - `CREATE TABLE IF NOT EXISTS …` so the file is idempotent.
   - `ENABLE ROW LEVEL SECURITY` on every new table.
   - Define RLS policies — public read where appropriate, role-based writes via the `get_user_role()` helper from migration 001.
   - For seeded data: `INSERT … ON CONFLICT DO NOTHING`.
3. Open Supabase Dashboard → SQL Editor → paste the file's contents → **Run**.
4. Verify in Table Editor.
5. Commit the migration file.

### RLS gotcha
The `get_user_role()` helper uses `auth_id = auth.uid()` to find the role from the `users` table. Don't write policies that compare `users.id = auth.uid()` directly — that's a different ID.

---

## Authentication

- **Supabase Auth** with email/password (magic link supported but mostly used for invitations).
- The `proxy.ts` enforces auth on protected paths.
- `/staff/*` requires role `staff` or `super_admin`. `/admin/*` requires `super_admin`.
- The `users` table has its own row per registered user, separate from `auth.users`. Roles live there.
- New users are auto-created on first OAuth callback or magic-link confirmation, with role inferred from `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` (a comma-separated env var).

SAML SSO for Swinburne is **not** wired — blocked on Swinburne IT delivering an IdP metadata XML.

---

## Deploy pipeline

1. Push to `origin/main`.
2. Vercel detects the push and starts a build.
3. ~1-2 minutes later it's live at https://www.svu3d.ai/bookings/.

To watch a deploy: Vercel Dashboard → SVU Booking project → **Deployments** tab.

If a deploy fails, click into it to see the build log. Common failures:
- TypeScript errors (run `npx tsc --noEmit` before pushing)
- Missing env vars (check Vercel → Project Settings → Environment Variables)

---

## Environment variables

Listed in `.env.example`. Production values are set in Vercel:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-aware) |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS — server-only, never expose |
| `NEXT_PUBLIC_BASE_PATH` | Set to `/bookings` in production, empty locally |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` | Comma-separated; new users with these emails get super_admin |
| `RESEND_API_KEY` | Email sending |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe (mostly dormant — Eventbrite is the active path) |
| `ANTHROPIC_API_KEY` | For future AI agents (not yet used) |
| `EVENTBRITE_PRIVATE_TOKEN` | Server-side Eventbrite API for live ticket counts |

---

## Coding patterns to mirror

- **Server components by default**, client components only where you need state, effects, or browser APIs.
- **Server actions** for form submissions: `'use server'` at the top of the file, `(_prevState, formData)` signature, return `{ error?: string }` or `{ success?: string }` shape, call `revalidatePath()` on success.
- **Form components** use `useActionState` from React 19. See `src/app/admin/events/new/new-event-form.tsx` for a canonical example.
- **Single-scrollable admin dashboard** — don't add a separate sub-page; add a section to `/admin/page.tsx` and an anchor link in the sidebar.
- **Card grid pattern** for stats: see `src/app/admin/page.tsx` ~line 89 — `rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5`.
- **Brand colour tokens** from `src/app/globals.css`: `swin-red`, `swin-red-hover`, `swin-red-light`, `swin-red-lighter`.

---

## Common tasks

### Add a new page
1. Create `src/app/<path>/page.tsx` (server component).
2. If it should be authenticated, place under `src/app/staff/` or `src/app/admin/` — the layout above enforces auth.
3. If it needs a server action, add `actions.ts` next to it (`'use server'`).

### Add a new admin section
1. Add a new section block to `src/app/admin/page.tsx` with `id="my-section"`.
2. Add a sidebar link with `href="/admin#my-section"`.

### Send an email
Use the existing helpers in `src/lib/email/`. **Always** include both `html:` and `text:` bodies (spam filter requirement). For broadcast/marketing emails, also include `List-Unsubscribe` headers.

### Add a Supabase query in a server component
Use `createClient()` from `@/lib/supabase/server`. RLS applies based on the logged-in user's auth cookie. For service-role operations (rare — admin-only writes that bypass RLS), use `createAdminClient()`.

---

## What's incomplete

- **Agents** (`agents/` dir empty) — the framework at `src/lib/anthropic/agent-runner.ts` exists but no agent definitions are wired. The original vision in `_docs/AI_AGENTS.md` lists 9 agents (intake, scheduling, comms, payments, reporting, etc.); none are implemented.
- **React Email templates** — emails are inline HTML strings. Consider migrating to `react-email/components` for maintainability.
- **`/admin/reports`** and **`/admin/maintenance`** — placeholder pages.
- **Conflict detection** in booking creation — currently nothing prevents a double-book.
- **Google Calendar sync** — not implemented.
- **SAML SSO** — blocked on Swinburne IT.
- **DMARC DNS** record — GoDaddy rejects the syntax; needs human-to-human resolution.

---

## Recommended first tasks

If you've just inherited the project and want to make a quick, valuable first move:

1. **Audit your access.** Verify you can log into Vercel, Supabase, Resend, GoDaddy, Eventbrite, and the GitHub repo before Carl steps away.
2. **Run a deploy** to make sure the pipeline works for you (a docs-only change is enough — push and watch Vercel rebuild).
3. **Sweep the lint errors.** There are 25-ish pre-existing ones across the codebase. Cleaning them up will give you a guided tour and unblock the lint-on-CI conversation.
4. **Pick one item from "What's incomplete"** that maps to current pain. The booking-conflict detector is high-value, low-scope.

---

## Where to read deeper

- [HANDOFF.md](HANDOFF.md) — top-level handoff context
- [PROGRESS.md](PROGRESS.md) — full session log; the rationale for most non-obvious decisions lives here
- [TECH_STACK.md](TECH_STACK.md) — original stack rationale (Next.js 16-aware updates noted)
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — schema reference
- [INTEGRATIONS.md](INTEGRATIONS.md) — per-service implementation notes
- [USER_ROLES.md](USER_ROLES.md) — permission matrix
- [AGENTS.md](../AGENTS.md) — at the repo root; AI-agent collaboration instructions for the codebase. Note: "This is NOT the Next.js you know" — read deprecation notices in `node_modules/next/dist/docs/` before relying on training-data conventions.
