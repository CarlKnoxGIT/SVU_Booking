-- ============================================================
-- 016 — Add Industry, deactivate Staff
-- Staff was redundant with Academics for Carl's reporting needs.
-- Industry replaces it (corporate / external organisations).
-- Existing Staff entries are left in place (admin can delete via
-- the recent-entries table on /staff/visitors if desired).
-- ============================================================

INSERT INTO visitor_categories (slug, label, sort_order) VALUES
  ('industry', 'Industry', 25)
ON CONFLICT (slug) DO NOTHING;

UPDATE visitor_categories
  SET is_active = FALSE
  WHERE slug = 'staff';
