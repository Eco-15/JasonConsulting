-- =============================================
-- Credits & Packages Migration
-- Run in Supabase SQL Editor AFTER migration.sql and fix-rls.sql
-- =============================================

-- -----------------------------------------------
-- STEP 1: Add credits_balance to profiles
-- -----------------------------------------------
alter table public.profiles
  add column if not exists credits_balance integer not null default 0;


-- -----------------------------------------------
-- STEP 2: packages table
-- -----------------------------------------------
create table if not exists public.packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tier_name text not null
    check (tier_name in ('bronze', 'silver', 'gold', 'platinum', 'vip')),
  package_type text not null
    check (package_type in ('consultation', 'membership')),
  billing_period text not null default 'once'
    check (billing_period in ('once', 'monthly', 'bimonthly', 'quarterly')),
  credits_granted integer not null,
  price_cents integer not null,
  stripe_price_id text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- -----------------------------------------------
-- STEP 3: credit_transactions table (immutable ledger)
-- -----------------------------------------------
create table if not exists public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.profiles(id) on delete cascade,
  transaction_type text not null
    check (transaction_type in ('purchase', 'deduction', 'subscription_renewal', 'refund')),
  credits_delta integer not null,
  balance_after integer not null,
  meeting_id uuid references public.meetings(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  stripe_session_id text,
  stripe_invoice_id text,
  description text,
  created_at timestamptz not null default now()
);


-- -----------------------------------------------
-- STEP 4: client_subscriptions table
-- -----------------------------------------------
create table if not exists public.client_subscriptions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete restrict,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'past_due', 'unpaid', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- -----------------------------------------------
-- STEP 5: Indexes
-- -----------------------------------------------
create index if not exists idx_credit_transactions_client_id
  on public.credit_transactions(client_id);

create index if not exists idx_credit_transactions_created_at
  on public.credit_transactions(created_at desc);

create index if not exists idx_credit_transactions_stripe_session
  on public.credit_transactions(stripe_session_id)
  where stripe_session_id is not null;

create index if not exists idx_credit_transactions_stripe_invoice
  on public.credit_transactions(stripe_invoice_id)
  where stripe_invoice_id is not null;

create index if not exists idx_client_subscriptions_client_id
  on public.client_subscriptions(client_id);

create index if not exists idx_client_subscriptions_stripe_sub_id
  on public.client_subscriptions(stripe_subscription_id);

create index if not exists idx_packages_type_period
  on public.packages(package_type, billing_period);


-- -----------------------------------------------
-- STEP 6: RLS Policies
-- -----------------------------------------------
alter table public.packages enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.client_subscriptions enable row level security;

-- packages: public read for active packages, admin write
create policy "Anyone can read active packages"
  on public.packages for select
  using (is_active = true);

create policy "Admins can read all packages"
  on public.packages for select
  using (public.is_admin());

create policy "Admins can insert packages"
  on public.packages for insert
  with check (public.is_admin());

create policy "Admins can update packages"
  on public.packages for update
  using (public.is_admin());

create policy "Admins can delete packages"
  on public.packages for delete
  using (public.is_admin());

-- credit_transactions: clients read own, admins read all; writes go through RPCs only
create policy "Clients can view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = client_id);

create policy "Admins can view all credit transactions"
  on public.credit_transactions for select
  using (public.is_admin());

-- client_subscriptions: clients read own, admins read all
create policy "Clients can view own subscriptions"
  on public.client_subscriptions for select
  using (auth.uid() = client_id);

create policy "Admins can view all subscriptions"
  on public.client_subscriptions for select
  using (public.is_admin());


-- -----------------------------------------------
-- STEP 7: Atomic credit deduction RPC
-- Deducts credits and writes ledger row atomically.
-- Returns { error } on insufficient credits, { success, new_balance } on success.
-- -----------------------------------------------
create or replace function public.deduct_credits(
  p_client_id uuid,
  p_credits    integer,
  p_meeting_id uuid,
  p_description text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_current_balance integer;
  v_new_balance     integer;
begin
  select credits_balance into v_current_balance
  from public.profiles
  where id = p_client_id
  for update;

  if v_current_balance < p_credits then
    return jsonb_build_object('error', 'Insufficient credits');
  end if;

  v_new_balance := v_current_balance - p_credits;

  update public.profiles
  set credits_balance = v_new_balance,
      updated_at = now()
  where id = p_client_id;

  insert into public.credit_transactions
    (client_id, transaction_type, credits_delta, balance_after, meeting_id, description)
  values
    (p_client_id, 'deduction', -p_credits, v_new_balance, p_meeting_id, p_description);

  return jsonb_build_object('success', true, 'new_balance', v_new_balance);
end;
$$;


-- -----------------------------------------------
-- STEP 8: Credit addition RPC (used by webhook)
-- -----------------------------------------------
create or replace function public.add_credits(
  p_client_id         uuid,
  p_credits           integer,
  p_transaction_type  text,
  p_package_id        uuid,
  p_stripe_session_id text default null,
  p_stripe_invoice_id text default null,
  p_description       text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_new_balance integer;
begin
  update public.profiles
  set credits_balance = credits_balance + p_credits,
      updated_at = now()
  where id = p_client_id
  returning credits_balance into v_new_balance;

  insert into public.credit_transactions
    (client_id, transaction_type, credits_delta, balance_after,
     package_id, stripe_session_id, stripe_invoice_id, description)
  values
    (p_client_id, p_transaction_type, p_credits, v_new_balance,
     p_package_id, p_stripe_session_id, p_stripe_invoice_id, p_description);

  return jsonb_build_object('success', true, 'new_balance', v_new_balance);
end;
$$;


-- -----------------------------------------------
-- STEP 9: Seed packages
-- IMPORTANT: Replace all stripe_price_id placeholder values with
-- real Stripe Price IDs after creating them in the Stripe Dashboard.
-- -----------------------------------------------
insert into public.packages
  (name, tier_name, package_type, billing_period, credits_granted, price_cents, stripe_price_id, sort_order)
values
  -- Consultation (one-time)
  ('Bronze Consultation',   'bronze',   'consultation', 'once', 30,   75000,  'price_bronze_consult_replace',    10),
  ('Silver Consultation',   'silver',   'consultation', 'once', 60,   125000, 'price_silver_consult_replace',    20),
  ('Gold Consultation',     'gold',     'consultation', 'once', 120,  200000, 'price_gold_consult_replace',      30),
  ('Platinum Consultation', 'platinum', 'consultation', 'once', 240,  350000, 'price_platinum_consult_replace',  40),
  ('VIP Consultation',      'vip',      'consultation', 'once', 480,  600000, 'price_vip_consult_replace',       50),

  -- Memberships — Monthly (interval: month, interval_count: 1)
  ('Bronze Monthly',        'bronze',   'membership', 'monthly',   30,   720000,  'price_bronze_monthly_replace',    60),
  ('Silver Monthly',        'silver',   'membership', 'monthly',   60,   1320000, 'price_silver_monthly_replace',    70),
  ('Gold Monthly',          'gold',     'membership', 'monthly',   120,  2220000, 'price_gold_monthly_replace',      80),
  ('Platinum Monthly',      'platinum', 'membership', 'monthly',   240,  3840000, 'price_platinum_monthly_replace',  90),
  ('VIP Monthly',           'vip',      'membership', 'monthly',   480,  6840000, 'price_vip_monthly_replace',       100),

  -- Memberships — Bi-Monthly (interval: month, interval_count: 2)
  ('Bronze Bi-Monthly',     'bronze',   'membership', 'bimonthly', 60,   390000,  'price_bronze_bimonthly_replace',  110),
  ('Silver Bi-Monthly',     'silver',   'membership', 'bimonthly', 120,  690000,  'price_silver_bimonthly_replace',  120),
  ('Gold Bi-Monthly',       'gold',     'membership', 'bimonthly', 240,  1140000, 'price_gold_bimonthly_replace',    130),
  ('Platinum Bi-Monthly',   'platinum', 'membership', 'bimonthly', 480,  1980000, 'price_platinum_bimonthly_replace',140),
  ('VIP Bi-Monthly',        'vip',      'membership', 'bimonthly', 960,  3480000, 'price_vip_bimonthly_replace',     150),

  -- Memberships — Quarterly (interval: month, interval_count: 3)
  ('Bronze Quarterly',      'bronze',   'membership', 'quarterly', 90,   280000,  'price_bronze_quarterly_replace',  160),
  ('Silver Quarterly',      'silver',   'membership', 'quarterly', 180,  480000,  'price_silver_quarterly_replace',  170),
  ('Gold Quarterly',        'gold',     'membership', 'quarterly', 360,  780000,  'price_gold_quarterly_replace',    180),
  ('Platinum Quarterly',    'platinum', 'membership', 'quarterly', 720,  1360000, 'price_platinum_quarterly_replace',190),
  ('VIP Quarterly',         'vip',      'membership', 'quarterly', 1440, 1360000, 'price_vip_quarterly_replace',     200)
on conflict (stripe_price_id) do nothing;
