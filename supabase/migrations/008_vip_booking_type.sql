-- Add 'vip' to the booking_type check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN (
    'academic', 'school', 'public_event',
    'external_hire', 'maintenance', 'recurring', 'vip'
  ));
