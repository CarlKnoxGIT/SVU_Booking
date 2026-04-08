# SVU_Booking — Database Schema

## Overview

All tables live in a Supabase-managed PostgreSQL database. Row Level Security (RLS) is enabled on all tables. The schema uses UUIDs as primary keys throughout.

---

## Tables

### `users`
Stores all platform users regardless of role.

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'public'
                CHECK (role IN ('super_admin', 'staff', 'school', 'hirer', 'public')),
  organisation TEXT,           -- School name or company name
  phone        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `facilities`
Represents bookable spaces (SVU LED wall + any future sub-spaces).

```sql
CREATE TABLE facilities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,          -- e.g. "Swinburne Virtual Universe"
  description  TEXT,
  capacity     INTEGER,                -- Max attendees
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `slots`
Individual time slots within the facility calendar.

```sql
CREATE TABLE slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id   UUID NOT NULL REFERENCES facilities(id),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  status        TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'blocked', 'booked', 'maintenance')),
  booking_id    UUID,                  -- FK set when booked (see below)
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (facility_id, date, start_time)
);
```

---

### `bookings`
Master booking record for all booking types.

```sql
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  facility_id     UUID NOT NULL REFERENCES facilities(id),
  slot_id         UUID REFERENCES slots(id),
  booking_type    TEXT NOT NULL
                    CHECK (booking_type IN (
                      'academic', 'school', 'public_event',
                      'external_hire', 'maintenance', 'recurring'
                    )),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                      'pending', 'proposed', 'confirmed',
                      'cancelled', 'completed', 'blocked', 'waitlisted'
                    )),
  title           TEXT,
  description     TEXT,
  attendee_count  INTEGER,
  requirements    JSONB,               -- Freeform technical/AV requirements
  metadata        JSONB,               -- Type-specific extra fields
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from slots back to bookings
ALTER TABLE slots ADD CONSTRAINT slots_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES bookings(id);
```

---

### `events`
Public ticketed events (subset of bookings, with extra fields).

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID UNIQUE REFERENCES bookings(id),
  title           TEXT NOT NULL,
  description     TEXT,
  event_date      DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  ticket_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_capacity    INTEGER NOT NULL,
  tickets_sold    INTEGER DEFAULT 0,  -- maintained by DB trigger (migration 011), do not update manually
  is_published    BOOLEAN DEFAULT FALSE,
  is_free         BOOLEAN DEFAULT FALSE,
  image_url       TEXT,               -- Supabase Storage URL (migration 007)
  humanitix_url   TEXT,               -- Optional external ticketing link (migration 004)
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `tickets`
Individual tickets for public events.

```sql
CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  payment_id    UUID REFERENCES payments(id),
  qr_code       TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  quantity      INTEGER NOT NULL DEFAULT 1,
  buyer_name    TEXT,            -- Name entered at checkout (preferred over users.full_name at check-in)
  cancel_token  UUID DEFAULT gen_random_uuid() UNIQUE,  -- Token for self-service cancellation link
  checked_in_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- tickets_sold on events is maintained by a DB trigger (migration 011), not manual updates
-- buyer_name added in migration 012; cancel_token added in migration 010
```

---

### `payments`
Stripe payment records.

```sql
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID REFERENCES bookings(id),
  event_id              UUID REFERENCES events(id),
  user_id               UUID NOT NULL REFERENCES users(id),
  stripe_payment_id     TEXT UNIQUE,   -- payment_intent or checkout session ID
  stripe_customer_id    TEXT,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'aud',
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN (
                            'pending', 'processing', 'succeeded',
                            'failed', 'refunded', 'partially_refunded'
                          )),
  payment_method        TEXT,          -- 'card', 'bank_transfer', etc.
  refund_amount         NUMERIC(10,2),
  stripe_refund_id      TEXT,
  invoice_url           TEXT,
  receipt_url           TEXT,
  metadata              JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `maintenance_windows`
Scheduled maintenance and technical downtime periods.

```sql
CREATE TABLE maintenance_windows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID NOT NULL REFERENCES facilities(id),
  scheduled_by    UUID NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  maintenance_type TEXT NOT NULL
                    CHECK (maintenance_type IN (
                      'routine', 'emergency', 'calibration', 'installation', 'inspection'
                    )),
  start_datetime  TIMESTAMPTZ NOT NULL,
  end_datetime    TIMESTAMPTZ NOT NULL,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `notifications`
Communications log — all emails, QR codes, and calendar invites sent.

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES bookings(id),
  ticket_id       UUID REFERENCES tickets(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,       -- 'booking_confirmed', 'ticket_purchase', etc.
  channel         TEXT NOT NULL        -- 'email', 'calendar_invite'
                    CHECK (channel IN ('email', 'calendar_invite', 'sms')),
  recipient_email TEXT NOT NULL,
  subject         TEXT,
  status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),
  external_id     TEXT,               -- Resend message ID
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB
);
```

---

### `recurring_series`
Tracks recurring booking series metadata.

```sql
CREATE TABLE recurring_series (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  facility_id     UUID NOT NULL REFERENCES facilities(id),
  pattern         TEXT NOT NULL        -- 'weekly', 'biweekly', 'monthly'
                    CHECK (pattern IN ('weekly', 'biweekly', 'monthly')),
  day_of_week     INTEGER,             -- 0=Sunday, 6=Saturday
  start_time      TIME NOT NULL,
  duration_mins   INTEGER NOT NULL,
  series_start    DATE NOT NULL,
  series_end      DATE,               -- NULL = indefinite
  status          TEXT DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add series_id to bookings for recurring instances
ALTER TABLE bookings ADD COLUMN series_id UUID REFERENCES recurring_series(id);
```

---

## Row Level Security (RLS) Policies

### Helper Function
```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;
```

### `users` Table
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- Super admins can read all users
CREATE POLICY "users_read_all_admin" ON users
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Users can update their own record
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth_id = auth.uid());
```

### `bookings` Table
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY "bookings_read_own" ON bookings
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Super admins can read all bookings
CREATE POLICY "bookings_read_all_admin" ON bookings
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Users can create bookings for themselves
CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Only super admins can update any booking; users can update status on their own
CREATE POLICY "bookings_update_admin" ON bookings
  FOR UPDATE USING (get_user_role() = 'super_admin');
```

### `events` Table
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Published events are readable by everyone (including anonymous)
CREATE POLICY "events_read_published" ON events
  FOR SELECT USING (is_published = TRUE);

-- Super admins can read all events
CREATE POLICY "events_read_all_admin" ON events
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Only super admins can create/edit events
CREATE POLICY "events_write_admin" ON events
  FOR ALL USING (get_user_role() = 'super_admin');
```

---

## Indexes

```sql
-- Frequently queried columns
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_slots_date ON slots(date);
CREATE INDEX idx_slots_facility_date ON slots(facility_id, date);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
```

---

## Relationships Diagram (Simplified)

```
auth.users (Supabase)
    └── users (1:1 via auth_id)
            ├── bookings (1:many)
            │       ├── slots (1:1)
            │       ├── events (1:1 for public_event type)
            │       │       └── tickets (1:many)
            │       │               └── payments (1:1)
            │       └── payments (1:1 for hire/academic)
            ├── tickets (1:many)
            ├── notifications (1:many)
            └── recurring_series (1:many)
                    └── bookings (1:many via series_id)

facilities
    ├── slots (1:many)
    ├── bookings (1:many)
    └── maintenance_windows (1:many)
```
