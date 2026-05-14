-- ============================================================
-- 021 — Security Advisor cleanup
-- Addresses the 14 warnings flagged by Supabase Security Advisor.
-- Tightens overly-permissive RLS policies, locks function search_path,
-- and fixes broken staff-role checks that compared users.id (internal UUID)
-- to auth.uid() (auth UUID) instead of users.auth_id.
-- ============================================================

-- ─── 1. event_notify_subscribers: drop the anon UPDATE policy ──────────────
-- src/app/events/actions.ts uses createAdminClient() (service_role bypasses
-- RLS), so this policy is not load-bearing. Removing it prevents anyone with
-- the anon key from PATCH-ing arbitrary subscriber rows via /rest/v1.
drop policy if exists "Public can update own subscription via upsert"
  on event_notify_subscribers;

-- ─── 2. notifications: restrict insert policy to service_role ──────────────
-- Original policy had no TO clause, so anon/authenticated could insert junk.
-- No application code touches this table via the anon/authenticated client.
drop policy if exists "notifications_insert_service" on notifications;
create policy "notifications_insert_service"
  on notifications for insert
  to service_role
  with check (true);

-- ─── 3. staff_requests: restrict policy to service_role ────────────────────
-- All access (admin pages + public registration flow) goes through
-- createAdminClient(). Restricting to service_role removes anon/authenticated
-- exposure via /rest/v1.
drop policy if exists "service role all" on staff_requests;
create policy "service role all"
  on staff_requests for all
  to service_role
  using (true)
  with check (true);

-- ─── 4. Lock function search_path (defense in depth) ───────────────────────
alter function public.get_user_role() set search_path = public, pg_temp;
alter function public.update_updated_at() set search_path = public, pg_temp;
alter function public.sync_tickets_sold() set search_path = public, pg_temp;

-- ─── 5. Revoke direct EXECUTE on the tickets-sold trigger function ─────────
-- sync_tickets_sold is only meant to fire from the tickets_sold_sync trigger.
-- Triggers run regardless of EXECUTE grants.
revoke execute on function public.sync_tickets_sold() from anon, authenticated;

-- ─── 6. Fix broken staff SELECT policies ───────────────────────────────────
-- Original policies compared users.id (internal UUID) to auth.uid(), which
-- never matches — they were dead code. Admin pages worked because they use
-- createAdminClient() (RLS bypass). Fix to compare users.auth_id = auth.uid()
-- so the policies actually grant staff access via the normal SSR client.

drop policy if exists "Staff can view and manage enquiries" on enquiries;
create policy "Staff can view and manage enquiries"
  on enquiries for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.auth_id = auth.uid()
        and users.role in ('staff', 'admin', 'super_admin')
    )
  );

drop policy if exists "Staff can view and manage subscribers" on event_notify_subscribers;
create policy "Staff can view and manage subscribers"
  on event_notify_subscribers for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.auth_id = auth.uid()
        and users.role in ('staff', 'admin', 'super_admin')
    )
  );
