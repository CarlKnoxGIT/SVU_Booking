-- ============================================================
-- 017 — Deactivate International Students category
-- Carl's reporting groups international students under Students,
-- so the standalone bucket is redundant on the public dashboard.
-- Reversible via Manage Categories UI if needed.
-- ============================================================

UPDATE visitor_categories
  SET is_active = FALSE
  WHERE slug = 'international_students';
