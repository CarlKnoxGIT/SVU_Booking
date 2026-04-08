-- Add a separate cancel token to tickets
-- Kept distinct from qr_code so the QR code shown at the door can't be used to cancel

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS cancel_token UUID UNIQUE DEFAULT gen_random_uuid();
