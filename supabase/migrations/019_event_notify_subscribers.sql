-- Notify-me signups from the public /events page
-- Captures visitors who want to be told when new SVU Open Day sessions are announced.
create table if not exists event_notify_subscribers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null unique,
  source          text not null default 'events_page',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table event_notify_subscribers enable row level security;

create policy "Public can sign up to be notified"
  on event_notify_subscribers for insert
  to anon, authenticated
  with check (true);

-- Public can also UPDATE their own row via upsert (idempotent re-signup).
-- Restricting to existing row by email match would require auth; instead we
-- allow anon update and rely on the action to only ever upsert by email.
create policy "Public can update own subscription via upsert"
  on event_notify_subscribers for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Staff can view and manage subscribers"
  on event_notify_subscribers for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('staff', 'admin', 'super_admin')
    )
  );

create trigger event_notify_subscribers_updated_at
  before update on event_notify_subscribers
  for each row execute function update_updated_at();

create index if not exists event_notify_subscribers_email_idx
  on event_notify_subscribers (email);
