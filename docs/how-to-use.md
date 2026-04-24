# SVU Booking — How to Use This Website

## Overview

The SVU Booking platform has three audiences:

| Who | What they do |
|-----|-------------|
| **General public** | Browse events, get tickets, enquire about hire |
| **School groups** | Find educational programs, submit a visit enquiry |
| **Staff / Admin** | Create events, manage bookings, view enquiries |

---

## For the Public

### Browsing events
1. Go to the homepage (`/`)
2. Click **Get tickets** (hero button) or **Events** in the footer
3. You'll see all upcoming events with date, start–end time, price, and tickets remaining. Counts are pulled live from Eventbrite every ~60s
4. When a session's tickets are almost gone the remaining-count turns red; once sold out the button greys out and reads **Sold out**

### Getting tickets
1. On the events page, click **Get tickets** next to the session you want
2. For events with an Eventbrite link, you'll open the Eventbrite page in a new tab to complete the purchase. Eventbrite sends the confirmation email + ticket
3. For events without an Eventbrite link (the internal-checkout path, currently unused for Open Day sessions), you'll go to our built-in Stripe page — select quantity, pay, and a confirmation email with a QR-coded e-ticket follows

### School group visits
1. Click **School visits** on the homepage or go to `/school-groups`
2. Browse the three programs (Primary, Lower Secondary, VCE)
3. Click **Enquire now** to fill in a contact form — the team will respond within 2 business days

### Private hire / corporate events
1. Click **Private hire → Enquire** on the homepage, or go to `/enquire`
2. Fill in your name, email, organisation, event type, estimated guest count, preferred dates, and any notes
3. Submit — the team will respond within 2 business days

---

## For Staff

### Signing in
1. Go to `/login` (or click **Staff sign in** in the top-right corner of any page)
2. Enter your `@swin.edu.au` or `@swinburne.edu.au` email address
3. Click **Send magic link** — check your inbox and click the link
4. You'll be redirected to the admin dashboard at `/admin`

> **Note:** Magic links expire after 1 hour. If yours has expired, just request a new one. Google OAuth was removed in Session 9 — staff login is email-only.

### The admin dashboard
The sidebar has five sections:

| Section | What's here |
|---------|-------------|
| **Dashboard** | Summary stats — total bookings, pending approvals, users, revenue |
| **Bookings** | Pending queue at the top; approve or decline with one click. All bookings listed below |
| **Events** | All public events with published/draft status. Create new events here |
| **Users** | All registered users. Change roles inline via the dropdown |
| **Reports** | Usage and revenue reports (in development) |

### Creating an event
1. Go to **Events → Create event** (`/admin/events/new`)
2. Fill in title, description, date, start/end time, ticket price (0 for free), and capacity
3. Paste an **Eventbrite URL** in the "Humanitix URL" field (legacy field name, now used for Eventbrite) — public buyers will be sent there and the `/events` page will read live remaining-ticket counts via the Eventbrite API. Leave blank to fall back to the internal Stripe checkout
4. Toggle **Publish immediately** if you want it live now, or leave it off to save as a draft
5. Click **Create event**

### Managing bookings
- **Pending** bookings appear at the top of `/admin/bookings` — click **Approve** or **Decline**
- All bookings are listed below with status badges

### Managing users
- Go to `/admin/users`
- Change any user's role using the dropdown — changes save automatically
- Available roles: `public`, `school`, `hirer`, `staff`, `super_admin`

---

## Roles explained

| Role | Access |
|------|--------|
| `public` | Can browse events and buy tickets |
| `school` | Same as public, intended for school contacts |
| `hirer` | Same as public, intended for corporate hirers |
| `staff` | Access to admin dashboard, can view bookings and events |
| `super_admin` | Full access — create/edit events, approve bookings, manage users |

Super admins are set via the `SUPER_ADMIN_EMAILS` environment variable and are automatically promoted on first login.
