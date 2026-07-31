-- Allow any staff member (not just super_admins) to delete visitor entries,
-- so they can correct mistakes like a double-counted group.
-- Category management (update) stays admin-only.

DROP POLICY IF EXISTS "entries_admin_delete" ON visitor_entries;

CREATE POLICY "entries_staff_delete" ON visitor_entries
  FOR DELETE
  USING (get_user_role() IN ('staff', 'super_admin'));
