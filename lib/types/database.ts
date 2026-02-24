export type UserRole = 'client' | 'admin'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
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
  created_at: string
  updated_at: string
}

export interface MeetingWithClient extends Meeting {
  profiles: Pick<Profile, 'full_name' | 'email'> | null
}
