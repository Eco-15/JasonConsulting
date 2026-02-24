'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookMeetingSchema } from '@/lib/validations/meetings'
import type { MeetingStatus } from '@/lib/types/database'

export async function bookMeeting(formData: {
  date: string
  time: string
  pricing_tier_id: string
  client_notes?: string
}) {
  const parsed = bookMeetingSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get pricing tier details
  const { data: tier } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('id', parsed.data.pricing_tier_id)
    .eq('is_active', true)
    .single()

  if (!tier) {
    return { error: 'Invalid pricing tier' }
  }

  // Build the start time
  const startTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`)
  const endTime = new Date(startTime.getTime() + tier.duration_minutes * 60 * 1000)

  // Check for conflicts with existing meetings
  const { data: conflicts } = await supabase
    .from('meetings')
    .select('id')
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt(
      'start_time',
      new Date(startTime.getTime() - 180 * 60 * 1000).toISOString()
    )

  // Filter actual overlapping meetings
  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot is no longer available. Please choose another.' }
  }

  // Check if the date is blocked
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', parsed.data.date)
    .single()

  if (blocked) {
    return { error: 'This date is not available for bookings.' }
  }

  // Check availability for the day of week
  const dayOfWeek = startTime.getDay()
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!availability) {
    return { error: 'No availability on this day.' }
  }

  // Insert the meeting
  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({
      client_id: user.id,
      title: 'Coaching Session',
      start_time: startTime.toISOString(),
      duration_minutes: tier.duration_minutes,
      price: tier.price,
      status: 'scheduled',
      client_notes: parsed.data.client_notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to book meeting. Please try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/bookings')
  return { data: meeting }
}

export async function cancelMeeting(meetingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('meetings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .eq('client_id', user.id)
    .eq('status', 'scheduled')

  if (error) {
    return { error: 'Failed to cancel meeting.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('meetings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', meetingId)

  if (error) {
    return { error: 'Failed to update meeting status.' }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addMeetingNotes(meetingId: string, notes: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('meetings')
    .update({ meeting_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', meetingId)

  if (error) {
    return { error: 'Failed to save notes.' }
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/dashboard')
  return { success: true }
}
