-- Enquiries table for hire / school group contact form submissions
create table if not exists enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  organisation text,
  event_type  text not null,
  guest_count integer,
  preferred_date text,
  message     text,
  status      text not null default 'new', -- new | in_progress | closed
  notes       text,                        -- internal staff notes
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Only staff/admin can read enquiries; public can insert
alter table enquiries enable row level security;

create policy "Public can submit enquiries"
  on enquiries for insert
  to anon, authenticated
  with check (true);

create policy "Staff can view and manage enquiries"
  on enquiries for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('staff', 'admin', 'super_admin')
    )
  );

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger enquiries_updated_at
  before update on enquiries
  for each row execute function update_updated_at();
