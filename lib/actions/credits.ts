'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookMeetingSchema } from '@/lib/validations/meetings'
import { createMeetingEvent } from '@/lib/google/calendar'

export async function bookMeetingWithCredits(formData: {
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
  if (!user) return { error: 'Not authenticated' }

  // Fetch pricing tier (duration = credits required, 1 credit = 1 minute)
  const { data: tier } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('id', parsed.data.pricing_tier_id)
    .eq('is_active', true)
    .single()

  if (!tier) return { error: 'Invalid session duration' }

  const creditsRequired = tier.duration_minutes

  // Verify balance before doing anything expensive
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits_balance < creditsRequired) {
    return {
      error: `You need ${creditsRequired} credits but have ${profile?.credits_balance ?? 0}. Please purchase a package first.`,
      insufficientCredits: true,
    }
  }

  const startTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`)
  const endTime = new Date(startTime.getTime() + tier.duration_minutes * 60 * 1000)

  // Conflict check
  const { data: conflicts } = await supabase
    .from('meetings')
    .select('id')
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt('start_time', new Date(startTime.getTime() - 180 * 60 * 1000).toISOString())

  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot is no longer available. Please choose another.' }
  }

  // Blocked date check
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', parsed.data.date)
    .maybeSingle()

  if (blocked) return { error: 'This date is not available for bookings.' }

  // Availability check
  const dayOfWeek = startTime.getDay()
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .maybeSingle()

  if (!availability) return { error: 'No availability on this day.' }

  // Insert the meeting record first
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      client_id: user.id,
      title: 'Coaching Session',
      start_time: startTime.toISOString(),
      duration_minutes: tier.duration_minutes,
      price: 0,
      status: 'scheduled',
      client_notes: parsed.data.client_notes || null,
    })
    .select()
    .single()

  if (meetingError || !meeting) {
    return { error: 'Failed to create meeting. Please try again.' }
  }

  // Atomically deduct credits via RPC (row-locked, prevents double-spend)
  const { data: rpcResult } = await supabase.rpc('deduct_credits', {
    p_client_id: user.id,
    p_credits: creditsRequired,
    p_meeting_id: meeting.id,
    p_description: `${tier.duration_minutes}-minute coaching session on ${parsed.data.date}`,
  })

  if (rpcResult?.error) {
    // Race condition: credits were used between the balance check and deduction
    await supabase.from('meetings').delete().eq('id', meeting.id)
    return { error: rpcResult.error }
  }

  // Create Google Calendar event with Meet link
  let meetUrl: string | null = null
  let googleEventId: string | null = null
  try {
    const clientName = profile.full_name || profile.email
    const result = await createMeetingEvent({
      title: `${tier.duration_minutes}min Coaching Session: Jason Graziani <> ${clientName}`,
      startTime,
      endTime,
      clientEmail: profile.email,
      notes: parsed.data.client_notes || undefined,
    })
    meetUrl = result.meetUrl
    googleEventId = result.eventId
  } catch (err) {
    console.error('Google Calendar event creation failed:', err)
  }

  // Update meeting with calendar details
  if (meetUrl || googleEventId) {
    await supabase
      .from('meetings')
      .update({ meet_url: meetUrl, google_event_id: googleEventId })
      .eq('id', meeting.id)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/book')
  revalidatePath('/admin/bookings')

  return {
    success: true,
    meeting: { ...meeting, meet_url: meetUrl },
    creditsUsed: creditsRequired,
    newBalance: rpcResult.new_balance as number,
  }
}
