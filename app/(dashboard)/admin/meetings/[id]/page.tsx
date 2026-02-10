import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MeetingNotesEditor } from '@/components/admin/meeting-notes-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function MeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase
    .from('meetings')
    .select(`
      *,
      profiles:client_id (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (!meeting) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/meetings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meeting Details</h1>
        <p className="text-muted-foreground">
          View and manage meeting information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p className="text-base font-medium">
                {meeting.profiles?.full_name || meeting.profiles?.email || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{meeting.profiles?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <p className="text-base">
                {new Date(meeting.start_time).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-base">{meeting.duration_minutes} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-base">${meeting.price}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge
                variant="outline"
                className={
                  meeting.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : meeting.status === 'cancelled'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
                }
              >
                {meeting.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <MeetingNotesEditor
          meetingId={meeting.id}
          initialNotes={meeting.meeting_notes || ''}
          meetingStatus={meeting.status}
        />
      </div>
    </div>
  )
}
