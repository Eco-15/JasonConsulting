-- =============================================
-- FIX: RLS infinite recursion on profiles table
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Create a helper function that checks admin status
-- WITHOUT going through RLS (security definer bypasses RLS)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;


-- Step 2: Drop the old problematic policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can view all meetings" on public.meetings;
drop policy if exists "Admins can update any meeting" on public.meetings;
drop policy if exists "Admins can insert pricing tiers" on public.pricing_tiers;
drop policy if exists "Admins can update pricing tiers" on public.pricing_tiers;
drop policy if exists "Admins can delete pricing tiers" on public.pricing_tiers;
drop policy if exists "Admins can insert availability" on public.availability;
drop policy if exists "Admins can update availability" on public.availability;
drop policy if exists "Admins can delete availability" on public.availability;
drop policy if exists "Admins can insert blocked dates" on public.blocked_dates;
drop policy if exists "Admins can delete blocked dates" on public.blocked_dates;


-- Step 3: Recreate all admin policies using the helper function

-- PROFILES
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- MEETINGS
create policy "Admins can view all meetings"
  on public.meetings for select
  using (public.is_admin());

create policy "Admins can update any meeting"
  on public.meetings for update
  using (public.is_admin());

-- PRICING TIERS
create policy "Admins can insert pricing tiers"
  on public.pricing_tiers for insert
  with check (public.is_admin());

create policy "Admins can update pricing tiers"
  on public.pricing_tiers for update
  using (public.is_admin());

create policy "Admins can delete pricing tiers"
  on public.pricing_tiers for delete
  using (public.is_admin());

-- AVAILABILITY
create policy "Admins can insert availability"
  on public.availability for insert
  with check (public.is_admin());

create policy "Admins can update availability"
  on public.availability for update
  using (public.is_admin());

create policy "Admins can delete availability"
  on public.availability for delete
  using (public.is_admin());

-- BLOCKED DATES
create policy "Admins can insert blocked dates"
  on public.blocked_dates for insert
  with check (public.is_admin());

create policy "Admins can delete blocked dates"
  on public.blocked_dates for delete
  using (public.is_admin());
