# SVU_Booking — Tech Stack

## Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 16.2.2 (App Router) + TypeScript | Full-stack React, API routes, SSR, excellent DX |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible components, rapid prototyping |
| **Database** | Supabase (PostgreSQL + Realtime + RLS) | Managed Postgres, built-in auth, real-time subscriptions, RLS |
| **Auth** | Supabase Auth + SAML 2.0 | Handles all auth flows; SAML for Swinburne SSO |
| **AI** | Anthropic Claude API (`claude-sonnet-4-6`) | Best-in-class tool use, reliable structured outputs |
| **Payments** | Stripe | Industry standard, excellent webhooks, strong TypeScript SDK |
| **Email** | Resend API | Modern, developer-friendly, excellent deliverability |
| **QR Codes** | `qrcode` npm package | Server-side generation, PNG output for email attachments |
| **Calendar Sync** | Google Calendar API + Microsoft Graph API | Covers both Google Workspace and Outlook users |
| **Deployment** | Vercel (planned) | Seamless Next.js deployment, edge functions, preview URLs |

---

## Framework: Next.js 16.2.2

- **App Router** for all routes (not Pages Router)
- **Server Components** by default; Client Components only where interactivity is needed
- **API Routes** (`app/api/`) for webhooks (Stripe, calendar), agent triggers, and internal APIs
- **Server Actions** for form submissions where appropriate
- TypeScript strict mode enabled

### Breaking Changes vs. Next.js 14
- `middleware.ts` is now `proxy.ts`, and the exported function must be named `proxy` (not `middleware`)

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public-facing routes (events, login)
│   ├── (dashboard)/        # Authenticated routes (admin, staff portals)
│   └── api/                # API routes (webhooks, agents)
├── components/             # Shared UI components
├── lib/                    # Utility functions, API clients
│   ├── supabase/           # Supabase client (server + browser)
│   ├── anthropic/          # Anthropic client + agent runner
│   ├── stripe/             # Stripe client
│   └── resend/             # Resend email client
├── proxy.ts                # Auth + role-based route protection (replaces middleware.ts)
└── types/                  # TypeScript type definitions
```

---

## Database: Supabase

- **PostgreSQL** — relational DB with full SQL support
- **Row Level Security (RLS)** — enforced at DB level, not just application layer
- **Realtime** — live updates for admin dashboard (booking status changes)
- **Storage** — for any uploaded assets (event images, documents)
- **Edge Functions** — available if needed for server-side logic outside Next.js

### Supabase Client Setup
- **Server-side**: `createServerClient` from `@supabase/ssr` (in Server Components and API routes)
- **Browser-side**: `createBrowserClient` from `@supabase/ssr` (in Client Components)
- Service role key only used server-side for admin/agent operations that bypass RLS

---

## Authentication: Supabase Auth + SAML 2.0

### Auth Flows
| User Type | Flow |
|-----------|------|
| Super Admin / Swinburne Staff | SAML 2.0 SSO via Swinburne's identity provider |
| School Contact / External Hirer | Email + password, or email magic link |
| General Public | Google OAuth or email magic link |

### Role Assignment
- On first SSO login: role inferred from email domain (`@swinburne.edu.au` → `staff`)
- Role stored in `users.role` column in the database
- Super Admin role manually assigned by existing Super Admin
- RLS policies check `auth.uid()` and join to `users.role`

---

## AI: Anthropic Claude API

- **Model**: `claude-sonnet-4-6` for all agents
- **SDK**: `@anthropic-ai/sdk` (official TypeScript SDK)
- **Pattern**: Tool use (function calling) for structured agent actions
- **Agent runner**: Custom `runAgent()` function in `lib/anthropic/agent-runner.ts`
  - Handles the tool-use loop (call → tool response → next call)
  - Enforces max iterations to prevent runaway loops
  - Logs all agent actions for audit trail

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Payments: Stripe

- **Checkout Sessions**: for public ticket purchases (hosted Stripe page)
- **Payment Links**: for external hire invoices
- **Invoices**: for formal hire agreements requiring PDF invoices
- **Webhooks**: `POST /api/webhooks/stripe` handles payment confirmation, failure, refund
- **SDK**: `stripe` npm package (server-side only — never expose secret key to browser)

### Key Stripe Events Handled
- `checkout.session.completed` → confirm booking, send ticket
- `payment_intent.payment_failed` → notify user
- `charge.refunded` → update booking status to `refunded`

### Environment Variables
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Email: Resend

- **SDK**: `resend` npm package
- **From address**: `bookings@svu.swinburne.edu.au` (TBC with Swinburne IT)
- **Templates**: React Email templates (`@react-email/components`) for HTML emails
- All emails logged to `notifications` table

### Environment Variables
```
RESEND_API_KEY=re_...
```

---

## QR Codes

- **Package**: `qrcode` (server-side generation)
- Generated as PNG Buffer and attached to emails via Resend
- QR data encodes: `booking_id` + `ticket_id` + HMAC signature for tamper detection
- Entry scanning: QR decoded by admin/ops staff using any standard QR scanner app

---

## Calendar Sync: Google Calendar API + Microsoft Graph

- **Google**: Service account credentials; writes to a dedicated SVU operations calendar
- **Microsoft**: OAuth app registration; supports Outlook calendar sync for staff
- Calendar events created on booking confirmation; updated/deleted on changes

### Environment Variables
```
GOOGLE_SERVICE_ACCOUNT_KEY=...
GOOGLE_CALENDAR_ID=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
```

---

## Deployment: Vercel

- **Environment**: Vercel production + preview deployments
- **Edge Runtime**: Not required initially; standard Node.js runtime
- **Environment Variables**: Set in Vercel dashboard (never commit to repo)
- **Database**: Supabase hosted (separate from Vercel)

---

## Local Development Setup

```bash
# Clone repo
git clone https://github.com/[org]/SVU_Booking.git
cd SVU_Booking

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all required values

# Run development server
npm run dev
```

### Required `.env.local` Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Google Calendar
GOOGLE_SERVICE_ACCOUNT_KEY=
GOOGLE_CALENDAR_ID=

# Microsoft Graph (optional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Monorepo vs. separate apps | Monorepo (single Next.js app) | Simpler to start; can split later |
| Pages Router vs. App Router | App Router | Modern, supports server components |
| ORM | None initially (raw Supabase queries) | Supabase JS client is sufficient; add Prisma if schema complexity grows |
| UI component library | shadcn/ui | Accessible, copy-paste components, full Tailwind integration |
| Email templating | React Email | Type-safe, testable, works well with Resend |
