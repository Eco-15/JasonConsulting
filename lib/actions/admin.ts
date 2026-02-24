'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminDashboardStats() {
  const supabase = await createClient()

  const now = new Date().toISOString()
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString()

  try {
    const [
      { count: upcomingCount },
      { data: monthMeetings },
      { count: totalClients },
      { count: completedCount },
      { data: upcomingMeetings },
    ] = await Promise.all([
      supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled')
        .gte('start_time', now),
      supabase
        .from('meetings')
        .select('price')
        .in('status', ['scheduled', 'completed'])
        .gte('start_time', monthStart),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client'),
      supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('meetings')
        .select(
          `*, profiles:client_id (full_name, email)`
        )
        .eq('status', 'scheduled')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5),
    ])

    const monthRevenue =
      monthMeetings?.reduce((sum, m) => sum + Number(m.price), 0) ?? 0

    return {
      upcomingCount: upcomingCount ?? 0,
      monthRevenue,
      totalClients: totalClients ?? 0,
      completedCount: completedCount ?? 0,
      upcomingMeetings: upcomingMeetings ?? [],
    }
  } catch {
    return {
      upcomingCount: 0,
      monthRevenue: 0,
      totalClients: 0,
      completedCount: 0,
      upcomingMeetings: [],
    }
  }
}
