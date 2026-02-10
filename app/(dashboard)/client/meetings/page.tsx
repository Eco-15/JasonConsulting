import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, FileText } from 'lucide-react'

export default async function ClientMeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date().toISOString()

  const [{ data: upcomingMeetings }, { data: pastMeetings }] = await Promise.all([
    supabase
      .from('meetings')
      .select('*')
      .eq('client_id', user.id)
      .gte('start_time', now)
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true }),
    supabase
      .from('meetings')
      .select('*')
      .eq('client_id', user.id)
      .or(`status.eq.completed,status.eq.cancelled,start_time.lt.${now}`)
      .order('start_time', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
        <p className="text-muted-foreground">
          View your upcoming and past coaching sessions.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMeetings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMeetings?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingMeetings && upcomingMeetings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingMeetings.map((meeting: any) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(meeting.start_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(meeting.start_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' '}({meeting.duration_minutes} minutes)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Scheduled
                      </Badge>
                      <span className="text-sm font-medium">${meeting.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No upcoming meetings. Book your next session!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastMeetings && pastMeetings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastMeetings.map((meeting: any) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(meeting.start_time).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{meeting.duration_minutes} minutes</span>
                    </div>
                    {meeting.meeting_notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Meeting Notes</span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {meeting.meeting_notes}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <Badge
                        variant="outline"
                        className={
                          meeting.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }
                      >
                        {meeting.status}
                      </Badge>
                      <span className="text-sm font-medium">${meeting.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No past meetings yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
