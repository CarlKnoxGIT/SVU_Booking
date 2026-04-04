-- Add start_time / end_time directly on bookings
-- (slots are optional; for direct staff bookings we store datetime here)

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
