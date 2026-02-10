'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/pending-requests')
  return { success: true }
}

export async function denyUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'denied' })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/pending-requests')
  return { success: true }
}

export async function updateMeetingNotes(meetingId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('meetings')
    .update({ meeting_notes: notes })
    .eq('id', meetingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/meetings')
  return { success: true }
}
