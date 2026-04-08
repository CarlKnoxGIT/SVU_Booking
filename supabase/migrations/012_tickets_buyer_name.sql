-- Store the name the purchaser entered at Stripe checkout on the ticket itself.
-- This avoids showing the wrong name when a registered user buys with a different name.
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS buyer_name TEXT;
