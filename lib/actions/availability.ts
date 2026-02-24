'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateAvailability(
  slots: {
    id?: string
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
  }[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Delete existing and re-insert
  await supabase.from('availability').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { error } = await supabase.from('availability').insert(
    slots.map((slot) => ({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available,
    }))
  )

  if (error) return { error: 'Failed to update availability.' }

  revalidatePath('/admin/availability')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function addBlockedDate(date: string, reason?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('blocked_dates')
    .insert({ blocked_date: date, reason: reason || null })

  if (error) {
    if (error.code === '23505') return { error: 'Date is already blocked.' }
    return { error: 'Failed to block date.' }
  }

  revalidatePath('/admin/availability')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function removeBlockedDate(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Failed to unblock date.' }

  revalidatePath('/admin/availability')
  revalidatePath('/dashboard/book')
  return { success: true }
}

export async function getAvailableSlots(date: string, durationMinutes: number) {
  const supabase = await createClient()

  const targetDate = new Date(date + 'T00:00:00')
  const dayOfWeek = targetDate.getDay()

  // Check availability for this day
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!availability) return { data: [] }

  // Check if the date is blocked
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', date)
    .single()

  if (blocked) return { data: [] }

  // Get existing meetings for this date
  const dayStart = new Date(date + 'T00:00:00').toISOString()
  const dayEnd = new Date(date + 'T23:59:59').toISOString()

  const { data: existingMeetings } = await supabase
    .from('meetings')
    .select('start_time, duration_minutes')
    .neq('status', 'cancelled')
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd)

  // Generate time slots based on availability window
  const [startHour, startMin] = availability.start_time.split(':').map(Number)
  const [endHour, endMin] = availability.end_time.split(':').map(Number)

  const slots: { value: string; label: string }[] = []
  const slotInterval = 30 // 30-minute intervals

  for (
    let minutes = startHour * 60 + startMin;
    minutes + durationMinutes <= endHour * 60 + endMin;
    minutes += slotInterval
  ) {
    const hour = Math.floor(minutes / 60)
    const min = minutes % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`

    const slotStart = new Date(`${date}T${timeString}:00`)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000)

    // Check for conflicts
    const hasConflict = existingMeetings?.some((meeting) => {
      const meetingStart = new Date(meeting.start_time)
      const meetingEnd = new Date(
        meetingStart.getTime() + meeting.duration_minutes * 60 * 1000
      )
      return slotStart < meetingEnd && slotEnd > meetingStart
    })

    if (!hasConflict) {
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
        'en-US',
        { hour: 'numeric', minute: '2-digit' }
      )
      slots.push({ value: timeString, label: displayTime })
    }
  }

  return { data: slots }
}
