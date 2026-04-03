create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Allow service role full access" on contacts
  for all using (true) with check (true);
