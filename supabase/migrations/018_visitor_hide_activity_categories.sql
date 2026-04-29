-- ============================================================
-- 018 — Hide Events and Astrotours from the public dashboard
-- Numbers are too low to feature publicly; revisit when they
-- pick up. Reversible via Manage Categories UI.
-- ============================================================

UPDATE visitor_categories
  SET is_active = FALSE
  WHERE slug IN ('events', 'astrotours');
