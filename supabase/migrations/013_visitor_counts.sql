-- ============================================================
-- 013 — Visitor counts dashboard
-- Append-only entry log + flexible categories lookup. Sums are
-- computed at read time. Public read, staff insert, admin manage.
-- ============================================================

-- ─── visitor_categories ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS visitor_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_derived  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON visitor_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "categories_admin_write" ON visitor_categories
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- ─── visitor_entries ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visitor_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES visitor_categories(id) ON DELETE CASCADE,
  count        INTEGER NOT NULL CHECK (count >= 0),
  entry_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  note         TEXT,
  recorded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visitor_entries_category_idx ON visitor_entries(category_id);
CREATE INDEX IF NOT EXISTS visitor_entries_date_idx     ON visitor_entries(entry_date);

ALTER TABLE visitor_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries_public_read" ON visitor_entries
  FOR SELECT USING (TRUE);

CREATE POLICY "entries_staff_insert" ON visitor_entries
  FOR INSERT
  WITH CHECK (get_user_role() IN ('staff', 'super_admin'));

CREATE POLICY "entries_admin_delete" ON visitor_entries
  FOR DELETE
  USING (get_user_role() = 'super_admin');

CREATE POLICY "entries_admin_update" ON visitor_entries
  FOR UPDATE
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

-- ─── Seed the 7 starter categories ───────────────────────────

INSERT INTO visitor_categories (slug, label, sort_order) VALUES
  ('students',               'Students',               10),
  ('staff',                  'Staff',                  20),
  ('vip',                    'VIP',                    30),
  ('international_students', 'International Students', 40),
  ('academics',              'Academics',              50),
  ('events',                 'Events',                 60),
  ('astrotours',             'Astrotours',             70)
ON CONFLICT (slug) DO NOTHING;
