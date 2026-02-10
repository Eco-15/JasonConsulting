import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Calendar, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalClients },
    { count: pendingRequests },
    { data: upcomingMeetings },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .eq('status', 'approved'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('meetings')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true })
      .limit(5),
  ])

  const stats = [
    {
      title: 'Total Clients',
      value: totalClients || 0,
      icon: Users,
      description: 'Approved clients',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests || 0,
      icon: UserCheck,
      description: 'Awaiting approval',
    },
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings?.length || 0,
      icon: Calendar,
      description: 'Next 5 scheduled',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your coaching business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings && upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting: any) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.start_time).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {meeting.duration_minutes} min
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${meeting.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming meetings scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
