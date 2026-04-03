-- ============================================================
-- SVU_Booking — Initial Schema Migration
-- Run this in the Supabase SQL editor or via supabase db push
-- ============================================================

-- ─── Helper function ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'public'
                  CHECK (role IN ('super_admin', 'staff', 'school', 'hirer', 'public')),
  organisation  TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "users_read_all_admin" ON users
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- ─── facilities ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS facilities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  capacity     INTEGER,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facilities_read_all" ON facilities
  FOR SELECT USING (TRUE);

CREATE POLICY "facilities_write_admin" ON facilities
  FOR ALL USING (get_user_role() = 'super_admin');

-- Seed the SVU facility
INSERT INTO facilities (name, description, capacity, is_active)
VALUES (
  'Swinburne''s Virtual Universe',
  '100m² curved LED wall with 360° stereo audio and 3D capability',
  60,
  TRUE
) ON CONFLICT DO NOTHING;

-- ─── slots ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id  UUID NOT NULL REFERENCES facilities(id),
  date         DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  status       TEXT NOT NULL DEFAULT 'available'
                 CHECK (status IN ('available', 'blocked', 'booked', 'maintenance')),
  booking_id   UUID,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (facility_id, date, start_time)
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slots_read_all" ON slots
  FOR SELECT USING (TRUE);

CREATE POLICY "slots_write_admin_staff" ON slots
  FOR ALL USING (get_user_role() IN ('super_admin', 'staff'));

CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_slots_facility_date ON slots(facility_id, date);

-- ─── bookings ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  facility_id         UUID NOT NULL REFERENCES facilities(id),
  slot_id             UUID REFERENCES slots(id),
  booking_type        TEXT NOT NULL
                        CHECK (booking_type IN (
                          'academic', 'school', 'public_event',
                          'external_hire', 'maintenance', 'recurring'
                        )),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                          'pending', 'proposed', 'confirmed',
                          'cancelled', 'completed', 'blocked', 'waitlisted'
                        )),
  title               TEXT,
  description         TEXT,
  attendee_count      INTEGER,
  requirements        JSONB,
  metadata            JSONB,
  approved_by         UUID REFERENCES users(id),
  approved_at         TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  series_id           UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_read_own" ON bookings
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "bookings_read_all_admin" ON bookings
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "bookings_update_admin" ON bookings
  FOR UPDATE USING (get_user_role() = 'super_admin');

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);

-- Add FK from slots back to bookings
ALTER TABLE slots ADD CONSTRAINT slots_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- ─── recurring_series ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recurring_series (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  facility_id   UUID NOT NULL REFERENCES facilities(id),
  pattern       TEXT NOT NULL CHECK (pattern IN ('weekly', 'biweekly', 'monthly')),
  day_of_week   INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  duration_mins INTEGER NOT NULL,
  series_start  DATE NOT NULL,
  series_end    DATE,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recurring_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "series_read_own" ON recurring_series
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "series_read_admin" ON recurring_series
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Add series_id FK to bookings
ALTER TABLE bookings ADD CONSTRAINT bookings_series_id_fkey
  FOREIGN KEY (series_id) REFERENCES recurring_series(id);

-- ─── events ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID UNIQUE REFERENCES bookings(id),
  title          TEXT NOT NULL,
  description    TEXT,
  event_date     DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  ticket_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_capacity   INTEGER NOT NULL,
  tickets_sold   INTEGER DEFAULT 0,
  is_published   BOOLEAN DEFAULT FALSE,
  is_free        BOOLEAN DEFAULT FALSE,
  image_url      TEXT,
  tags           TEXT[],
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_read_published" ON events
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "events_read_all_admin" ON events
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "events_write_admin" ON events
  FOR ALL USING (get_user_role() = 'super_admin');

-- ─── payments ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID REFERENCES bookings(id),
  event_id            UUID REFERENCES events(id),
  user_id             UUID NOT NULL REFERENCES users(id),
  stripe_payment_id   TEXT UNIQUE,
  stripe_customer_id  TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'aud',
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                          'pending', 'processing', 'succeeded',
                          'failed', 'refunded', 'partially_refunded'
                        )),
  payment_method      TEXT,
  refund_amount       NUMERIC(10,2),
  stripe_refund_id    TEXT,
  invoice_url         TEXT,
  receipt_url         TEXT,
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_read_own" ON payments
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "payments_read_admin" ON payments
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);

-- ─── tickets ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  payment_id    UUID REFERENCES payments(id),
  qr_code       TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  quantity      INTEGER NOT NULL DEFAULT 1,
  checked_in_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_read_own" ON tickets
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tickets_read_admin" ON tickets
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

-- ─── maintenance_windows ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id      UUID NOT NULL REFERENCES facilities(id),
  scheduled_by     UUID NOT NULL REFERENCES users(id),
  title            TEXT NOT NULL,
  maintenance_type TEXT NOT NULL
                     CHECK (maintenance_type IN (
                       'routine', 'emergency', 'calibration', 'installation', 'inspection'
                     )),
  start_datetime   TIMESTAMPTZ NOT NULL,
  end_datetime     TIMESTAMPTZ NOT NULL,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_read_admin_staff" ON maintenance_windows
  FOR SELECT USING (get_user_role() IN ('super_admin', 'staff'));

CREATE POLICY "maintenance_write_admin" ON maintenance_windows
  FOR ALL USING (get_user_role() = 'super_admin');

-- ─── notifications ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES bookings(id),
  ticket_id       UUID REFERENCES tickets(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'calendar_invite', 'sms')),
  recipient_email TEXT NOT NULL,
  subject         TEXT,
  status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),
  external_id     TEXT,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  metadata        JSONB
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_admin" ON notifications
  FOR SELECT USING (get_user_role() = 'super_admin');

CREATE POLICY "notifications_insert_service" ON notifications
  FOR INSERT WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);
