-- ============================================================
-- 015 — Distinguish people-categories from activity-categories
-- Total Visitors is now computed = sum(non-activity categories).
-- Events + Astrotours are activities and excluded from the total.
-- The previously-seeded 'total_visitors' row becomes obsolete.
-- ============================================================

ALTER TABLE visitor_categories
  ADD COLUMN IF NOT EXISTS is_activity BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE visitor_categories
  SET is_activity = TRUE
  WHERE slug IN ('events', 'astrotours');

DELETE FROM visitor_categories
  WHERE slug = 'total_visitors';
