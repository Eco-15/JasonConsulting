-- =============================================
-- Jason Graziani Consulting - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PRICING TIERS TABLE
create table public.pricing_tiers (
  id uuid default gen_random_uuid() primary key,
  duration_minutes integer not null,
  price numeric(10,2) not null,
  label text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- 3. AVAILABILITY TABLE (weekly schedule)
create table public.availability (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);


-- 4. BLOCKED DATES TABLE
create table public.blocked_dates (
  id uuid default gen_random_uuid() primary key,
  blocked_date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);


-- 5. MEETINGS TABLE
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete set null,
  title text not null default 'Coaching Session',
  start_time timestamptz not null,
  duration_minutes integer not null,
  price numeric(10,2) not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  meeting_notes text,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- 6. INDEXES
create index idx_meetings_client_id on public.meetings(client_id);
create index idx_meetings_start_time on public.meetings(start_time);
create index idx_meetings_status on public.meetings(status);
create index idx_availability_day on public.availability(day_of_week);


-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.availability enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.meetings enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- PRICING TIERS policies (public read, admin write)
create policy "Anyone can read pricing tiers"
  on public.pricing_tiers for select
  using (true);

create policy "Admins can insert pricing tiers"
  on public.pricing_tiers for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update pricing tiers"
  on public.pricing_tiers for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete pricing tiers"
  on public.pricing_tiers for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- AVAILABILITY policies (public read, admin write)
create policy "Anyone can read availability"
  on public.availability for select
  using (true);

create policy "Admins can insert availability"
  on public.availability for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update availability"
  on public.availability for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete availability"
  on public.availability for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- BLOCKED DATES policies (public read, admin write)
create policy "Anyone can read blocked dates"
  on public.blocked_dates for select
  using (true);

create policy "Admins can insert blocked dates"
  on public.blocked_dates for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete blocked dates"
  on public.blocked_dates for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- MEETINGS policies
create policy "Clients can view own meetings"
  on public.meetings for select
  using (auth.uid() = client_id);

create policy "Admins can view all meetings"
  on public.meetings for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can create meetings"
  on public.meetings for insert
  with check (auth.uid() = client_id);

create policy "Admins can update any meeting"
  on public.meetings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can update own scheduled meetings"
  on public.meetings for update
  using (auth.uid() = client_id and status = 'scheduled');


-- =============================================
-- SEED DATA
-- =============================================

-- Default pricing tiers
insert into public.pricing_tiers (duration_minutes, price, label, description, sort_order) values
  (30, 100.00, 'Quick Consultation', 'A focused 30-minute session for specific questions.', 1),
  (60, 175.00, 'Standard Session', 'A full-hour deep dive into your challenges.', 2),
  (90, 250.00, 'Deep Dive Session', 'An extended session for comprehensive strategy work.', 3);

-- Default availability (Mon-Fri 9am-5pm, weekends off)
insert into public.availability (day_of_week, start_time, end_time, is_available) values
  (0, '09:00', '17:00', false),  -- Sunday
  (1, '09:00', '17:00', true),   -- Monday
  (2, '09:00', '17:00', true),   -- Tuesday
  (3, '09:00', '17:00', true),   -- Wednesday
  (4, '09:00', '17:00', true),   -- Thursday
  (5, '09:00', '17:00', true),   -- Friday
  (6, '09:00', '17:00', false);  -- Saturday


-- =============================================
-- SET ADMIN USER
-- Run this AFTER the admin user has signed up,
-- or update the email below to match yours.
-- =============================================
-- update public.profiles set role = 'admin' where email = 'jason@jasongraziani.com';
