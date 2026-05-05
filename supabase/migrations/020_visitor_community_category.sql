-- ============================================================
-- 020 — Add Community visitor category
-- Members of the general public — distinct from Students /
-- Academics+Staff / Industry+VIP. Slotted between Students (10)
-- and Industry (25) so it appears second on the public dashboard.
-- ============================================================

INSERT INTO visitor_categories (slug, label, sort_order) VALUES
  ('community', 'Community', 15)
ON CONFLICT (slug) DO NOTHING;
