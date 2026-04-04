-- Add optional Humanitix ticketing URL to events.
-- When set, "Get tickets" links to Humanitix instead of the internal Stripe checkout.
alter table events add column if not exists humanitix_url text;
