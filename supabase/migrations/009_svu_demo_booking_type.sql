-- Add 'svu_demo' to the booking_type check constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN (
    'academic', 'school', 'public_event',
    'external_hire', 'maintenance', 'recurring', 'vip', 'svu_demo'
  ));
