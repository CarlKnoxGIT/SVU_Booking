-- ============================================================
-- 014 — Add 'Total Visitors' as the hero category
-- Entered independently; not a sum of the others (which overlap).
-- ============================================================

INSERT INTO visitor_categories (slug, label, sort_order) VALUES
  ('total_visitors', 'Total Visitors', 0)
ON CONFLICT (slug) DO NOTHING;
