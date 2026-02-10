'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface BookMeetingParams {
  clientId: string
  startTime: string
  endTime: string
  durationMinutes: number
  price: number
}

export async function bookMeeting(params: BookMeetingParams) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      client_id: params.clientId,
      title: 'Coaching Session',
      start_time: params.startTime,
      end_time: params.endTime,
      duration_minutes: params.durationMinutes,
      price: params.price,
      status: 'scheduled',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/client/calendar')
  revalidatePath('/client/meetings')
  return { success: true, data }
}

export async function cancelMeeting(meetingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('meetings')
    .update({ status: 'cancelled' })
    .eq('id', meetingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/client/meetings')
  return { success: true }
}

export async function getPricing() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meeting_pricing')
    .select('*')
    .eq('is_active', true)
    .order('duration_minutes', { ascending: true })

  if (error) {
    console.error('Error fetching pricing:', error)
    return []
  }

  return data || []
}
