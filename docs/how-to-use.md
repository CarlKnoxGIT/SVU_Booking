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
3. You'll see all upcoming events with date, time, price, and tickets remaining

### Getting tickets
1. On the events page, click **Get tickets** next to the session you want
2. If the event uses Humanitix, you'll be taken to the Humanitix page to complete your booking
3. If the event uses our internal checkout, select your quantity and click **Pay** — you'll be redirected to Stripe's secure payment page
4. After payment, you'll land on a confirmation page. A receipt email will follow

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
4. Alternatively, click **Continue with Google** if your Swinburne Google account is set up
5. You'll be redirected to the admin dashboard at `/admin`

> **Note:** Magic links expire after 1 hour. If yours has expired, just request a new one.

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
3. Paste a **Humanitix URL** if you're using Humanitix for ticketing — leave blank to use the internal Stripe checkout
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
