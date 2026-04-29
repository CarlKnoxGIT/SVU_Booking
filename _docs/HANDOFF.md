# SVU Booking — Handoff Guide

> Read this first if you're taking over the SVU Booking site from Carl Knox.
> Last updated: 2026-04-29 (Session 11)

---

## What this is

A booking, ticketing, and visitor-tracking website for **Swinburne's Virtual Universe (SVU)** — the 100m² LED-wall facility at Swinburne's Hawthorn campus. It handles:

- Public ticket sales (via Eventbrite, embedded into the site)
- Staff bookings of the SVU for academic/SVU demo use
- School and external-hire enquiries
- Event check-in via QR scanner
- Visitor count dashboard on the homepage

**Live site:** https://www.svu3d.ai/bookings/
**GitHub:** https://github.com/CarlKnoxGIT/SVU_Booking
**Hosting:** Vercel (auto-deploys on push to `main`)
**Database:** Supabase project `neibpbkholgoypswyalx`

---

## Who is this guide for?

Two audiences. Pick your path:

### A. Operator (non-technical)
You'll keep the site running day-to-day: approving booking requests, replying to enquiries, doing event check-in, updating visitor counts. You don't need to touch code.
→ **Start with [OPERATOR_GUIDE.md](OPERATOR_GUIDE.md)**

### B. Developer (technical)
You'll continue building features, fixing bugs, deploying changes.
→ **Start with [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)**

Most takeovers will involve **both** — read whichever matches your starting point first.

---

## The most important things to know

These trip up newcomers within the first hour. Read them before doing anything else.

1. **The site lives at `/bookings/...`, not at the root.** The Vercel deployment uses a `NEXT_PUBLIC_BASE_PATH` env var set to `/bookings`. Every URL in production includes it:
   - Homepage: `https://www.svu3d.ai/bookings/`
   - Staff portal: `https://www.svu3d.ai/bookings/staff`
   - Admin panel: `https://www.svu3d.ai/bookings/admin`
   - **`/staff` and `/admin` without the `/bookings` prefix will 404.**

2. **Public ticketing is on Eventbrite, not the built-in Stripe checkout.** When users click "Get tickets" on the events page, they're sent to Eventbrite. The internal Stripe checkout still exists in the codebase but is dormant. This was a Session 9 decision driven by email deliverability problems on the new `svu3d.ai` domain.

3. **Email to `@swin.edu.au` addresses gets silently dropped by Swinburne Exchange.** This is unresolved. As a workaround, enquiry notifications are CC'd to `carlknox@gmail.com`. If you take over, you'll likely want to chase Swinburne IT to whitelist `bookings@svu3d.ai`, or work with them on a DMARC record (GoDaddy has been rejecting the syntax). See [PROGRESS.md](PROGRESS.md) Session 8/9 for full context.

4. **Supabase migrations are run manually in the dashboard SQL Editor.** No CLI workflow. Every `.sql` file in `supabase/migrations/` was copied and pasted into Supabase → SQL Editor → Run. If you add a new migration, that's how you apply it.

5. **Pushes go directly to `main`. Vercel auto-deploys.** No PR review. Single-developer pace; the whole git history is direct commits to `main`.

6. **The same Supabase project serves dev and prod.** There is no staging DB. Be careful — if you mess up data via the SQL Editor, you've messed up production.

7. **Many "features" in `_docs/AI_AGENTS.md` and `_docs/PROJECT_OVERVIEW.md` are aspirational, not built.** The agents framework exists at `src/lib/anthropic/agent-runner.ts` but no agents are implemented. React Email templates are not built. Don't assume something is real because there's a doc for it — check the code.

---

## Accounts and access — what to ask Carl for

Before he hands off, get him to transfer ownership or add you as admin/owner on each:

| Service | Used for | What you need |
|---------|----------|---------------|
| **GitHub** (`github.com/CarlKnoxGIT/SVU_Booking`) | Code repo | Collaborator/owner access |
| **Vercel** | Deployment, env vars, domain config | Team membership or transfer |
| **Supabase** (project `neibpbkholgoypswyalx`) | Database, auth, storage | Member/owner role |
| **Resend** | Transactional email sending | Account access; check `svu3d.ai` domain status |
| **GoDaddy** (DNS for `svu3d.ai`) | Domain DNS records (SPF, DKIM, DMARC) | Login / domain ownership transfer |
| **Eventbrite** | Public ticket sales for SVU events | Organiser account access; URLs are stored in the `events.humanitix_url` field in Supabase |
| **Stripe** | Set up but not actively used | Account access (in case it's needed later) |
| **Anthropic API** | Future AI agents (not yet implemented) | API key in Vercel env vars; account access |
| **Microsoft SNDS** | Hotmail/Outlook reputation registration | Not yet registered (per Session 8 backlog) |

**Don't take credentials by email or chat.** Have Carl add you to each service via that service's "invite member" flow, then he revokes his own access if needed.

---

## What's done vs. what's not

### Live and working
- Public homepage with hero, parallax sections, visitor-count dashboard
- Public events listing with live remaining-ticket counts (pulled from Eventbrite API)
- Eventbrite checkout flow for tickets
- School groups and Private Hire pages with enquiry forms
- Staff portal: booking calendar, booking creation/editing, QR check-in scanner, visitor count entry
- Admin portal: bookings management, events management, enquiries, check-in tally, user/role management, broadcast emails, staff access requests
- Supabase SSR auth with email/password
- Resend transactional emails (with Gmail CC backup for @swin.edu.au recipients)

### Placeholders only
- `/admin/reports` — "Coming soon"
- `/admin/maintenance` — "Coming soon"

### Not built
- AI agents (the directory is empty; the framework exists but no agents are wired)
- React Email templates (emails use inline HTML+text strings)
- Conflict detection on booking requests
- Google Calendar integration
- SAML 2.0 SSO for Swinburne staff (blocked on Swinburne IT)

### Carl's open backlog
- DMARC DNS record (GoDaddy syntax issue)
- Microsoft SNDS registration
- Swinburne Exchange whitelist for `bookings@svu3d.ai`
- Re-enable homepage hero "Get tickets" button (currently a dimmed `<span>`)
- Day-one baseline visitor count entries

See [PROGRESS.md](PROGRESS.md) for the full session log.

---

## Where to read deeper

| Doc | When to read |
|-----|--------------|
| [OPERATOR_GUIDE.md](OPERATOR_GUIDE.md) | You're operating the site day-to-day |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | You're going to write code |
| [PROGRESS.md](PROGRESS.md) | You want the full history of decisions and what was tried |
| [TECH_STACK.md](TECH_STACK.md) | You want to understand the technology choices |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | You're querying or migrating the DB |
| [USER_ROLES.md](USER_ROLES.md) | You're adjusting permissions |
| [BOOKING_FLOWS.md](BOOKING_FLOWS.md) | You're working on the booking experience |
| [INTEGRATIONS.md](INTEGRATIONS.md) | You're adding/fixing an external service |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | You want the original vision (note: parts are aspirational) |
| [AI_AGENTS.md](AI_AGENTS.md) | You're going to actually build the agents (none exist yet) |

---

## When something breaks

1. **First check Vercel Deployments** — most "site is broken" reports trace to a failed deploy.
2. **Check Supabase Status** at https://status.supabase.com if database queries are failing.
3. **Check Resend dashboard** if emails aren't arriving — but remember Swinburne Exchange may also be silently dropping them.
4. **For visitor-count weirdness** — check `/bookings/staff/visitors` recent entries table; bad data is fixable by an admin.

---

## Contact

This handoff was produced collaboratively by Carl Knox and Claude (Anthropic). For questions about the original build decisions, Carl is the source of truth. The `PROGRESS.md` session log captures the rationale for most non-obvious choices.
