import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, FileText } from 'lucide-react'

// Demo data for presentation
const upcomingMeetings = [
  {
    id: '1',
    title: 'Coaching Session',
    start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    price: 150,
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Coaching Session',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 30,
    price: 75,
    status: 'scheduled',
  },
]

const pastMeetings = [
  {
    id: '3',
    title: 'Coaching Session',
    start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    price: 200,
    status: 'completed',
    meeting_notes: 'Great session! We discussed leadership strategies and set goals for Q2. Key action items: 1) Complete the leadership assessment by Friday. 2) Schedule follow-up with team leads. 3) Review the recommended reading list.',
  },
  {
    id: '4',
    title: 'Coaching Session',
    start_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    price: 150,
    status: 'completed',
    meeting_notes: 'Initial consultation. Identified key areas for growth and established coaching objectives.',
  },
]

export default function DemoClientPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white h-screen sticky top-0">
          <div className="border-b p-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-900 rounded" />
              <span className="text-xl font-semibold">Jason Graziani</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Client Portal</p>
          </div>
          <nav className="p-4 space-y-1">
            <a href="/demo/client/book" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <Calendar className="h-5 w-5" />
              Book a Meeting
            </a>
            <a href="/demo/client" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-white text-gray-900 shadow-sm">
              <FileText className="h-5 w-5" />
              My Meetings
            </a>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">John Smith</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
              <p className="text-gray-500">
                View your upcoming and past coaching sessions.
              </p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingMeetings.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastMeetings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
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
                          <Clock className="h-4 w-4 text-gray-500" />
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
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {pastMeetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(meeting.start_time).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{meeting.duration_minutes} minutes</span>
                        </div>
                        {meeting.meeting_notes && (
                          <div className="mt-4 rounded-lg bg-gray-50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Meeting Notes</span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {meeting.meeting_notes}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {meeting.status}
                          </Badge>
                          <span className="text-sm font-medium">${meeting.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
