export type UserRole = 'client' | 'admin'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  credits_balance: number
  created_at: string
  updated_at: string
}

export type PackageTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip'
export type PackageType = 'consultation' | 'membership'
export type BillingPeriod = 'once' | 'monthly' | 'bimonthly' | 'quarterly'
export type TransactionType = 'purchase' | 'deduction' | 'subscription_renewal' | 'refund'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing'

export interface Package {
  id: string
  name: string
  tier_name: PackageTier
  package_type: PackageType
  billing_period: BillingPeriod
  credits_granted: number
  price_cents: number
  stripe_price_id: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  client_id: string
  transaction_type: TransactionType
  credits_delta: number
  balance_after: number
  meeting_id: string | null
  package_id: string | null
  stripe_session_id: string | null
  stripe_invoice_id: string | null
  description: string | null
  created_at: string
}

export interface ClientSubscription {
  id: string
  client_id: string
  package_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface PricingTier {
  id: string
  duration_minutes: number
  price: number
  label: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Availability {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

export interface BlockedDate {
  id: string
  blocked_date: string
  reason: string | null
  created_at: string
}

export interface Meeting {
  id: string
  client_id: string | null
  title: string
  start_time: string
  duration_minutes: number
  price: number
  status: MeetingStatus
  meeting_notes: string | null
  client_notes: string | null
  stripe_session_id: string | null
  meet_url: string | null
  google_event_id: string | null
  created_at: string
  updated_at: string
}

export interface MeetingWithClient extends Meeting {
  profiles: Pick<Profile, 'full_name' | 'email'> | null
}
