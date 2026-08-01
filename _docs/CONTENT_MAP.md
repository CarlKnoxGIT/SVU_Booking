# Where the content lives

A map of what part of the SVU_Booking site is stored where, and where to go to change any given thing.

## GitHub — code + static content
- **Repo:** `CarlKnoxGIT/SVU_Booking`, branch `main`. Local working copy: `/Volumes/Nova SVU/033 SVU Website/SVU_Booking`.
- **Holds:** everything that *is* the website — page layouts and copy (homepage hero, banners, events page), images (`public/images/`), styling (`src/app/globals.css`), and these docs (`_docs/`, `CLAUDE.md`).
- **Change flow:** edit files → `git commit` → `git push origin main` (Vercel auto-deploys).
- **Note:** the working copy is on an external volume that flips file executable bits, so `git status` can show the whole tree as modified. `git config core.fileMode false` (repo-local) silences it.

## Vercel — hosting + secrets
- **Project:** `svu-booking` (under "Carl Knox's projects", Hobby plan). Watches `main`, auto-deploys on push.
- **Live site:** https://www.svu3d.ai/bookings/
- **Holds:** the built/served site + environment variables (Settings → Environment Variables): `EVENTBRITE_PRIVATE_TOKEN`, Supabase keys, Stripe/Resend keys, etc.
- **Note:** changing a secret requires a **redeploy** to take effect. Vercel stores no data and does not run DB migrations.

## Supabase — the live database
- **Project:** `neibpbkholgoypswyalx` (production only — no staging DB).
- **Holds:** all dynamic data — `events` (event listings, descriptions, dates, prices), `visitor_entries` / `visitor_categories` (visitor counter), `bookings`, `enquiries`, `users`, mailing-list subscribers, `payments`.
- **Security:** row-level security (RLS) policies gate reads/writes by role.
- **Schema changes:** SQL files live in `supabase/migrations/` in the repo but are applied **by hand** in the Supabase SQL Editor.
- **Day-to-day:** edit this data through the app's `/admin` and `/staff` panels, not the DB directly.

## External services (ticketing + comms)
- **Eventbrite** — hosts paid event checkout (Worlds of the Solar System). The events page reads live availability via the Eventbrite API and links out. Requires an API token from the **owning** organizer account (`svu@swin.edu.au`).
- **Humanitix** — hosts other external registrations (e.g. Seeds of Science Festival). The events page just links to it (no live count — that's Eventbrite-only).
- **Stripe** — wired in but not active for public tickets.
- **Resend** — transactional email.
- **QR codes** — generated in-app for check-in.

## "Where do I change X?" cheat sheet
| To change… | Go to… |
|------------|--------|
| Page text, design, banners, images | Code (GitHub) → commit + push |
| An event's details/price, visitor counts, bookings | The database, via `/admin` or `/staff` panels |
| A permission / security rule | Supabase SQL Editor (a migration) |
| An API key or secret | Vercel env vars (then redeploy) |
| Actual ticket purchases / buyer data | Eventbrite / Humanitix (not this site) |
