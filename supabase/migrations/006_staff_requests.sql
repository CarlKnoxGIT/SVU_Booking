create table if not exists staff_requests (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null unique,
  message     text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table staff_requests enable row level security;

-- Service role has full access
create policy "service role all" on staff_requests
  for all using (true);
