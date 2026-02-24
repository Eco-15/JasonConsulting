import { getAdminDashboardStats } from '@/lib/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react'

export default async function AdminOverviewPage() {
  const stats = await getAdminDashboardStats()

  const statCards = [
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingCount,
      icon: Calendar,
      description: 'Scheduled sessions',
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.monthRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'From bookings',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      description: 'Registered clients',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedCount,
      icon: CheckCircle,
      description: 'All time',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here&apos;s an overview of your coaching business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
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
          {stats.upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {stats.upcomingMeetings.map((meeting: any) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {meeting.profiles?.full_name ||
                          meeting.profiles?.email ||
                          'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
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
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      ${meeting.price}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No upcoming meetings scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
