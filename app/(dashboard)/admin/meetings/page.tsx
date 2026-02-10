import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileEdit } from 'lucide-react'

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meetings')
    .select(`
      *,
      profiles:client_id (
        full_name,
        email
      )
    `)
    .order('start_time', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Meetings</h1>
        <p className="text-muted-foreground">
          View and manage all client meetings.
        </p>
      </div>

      {meetings && meetings.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting: any) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">
                    {meeting.profiles?.full_name || meeting.profiles?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {new Date(meeting.start_time).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>{meeting.duration_minutes} min</TableCell>
                  <TableCell>${meeting.price}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/meetings/${meeting.id}`}>
                        <FileEdit className="mr-1 h-4 w-4" />
                        {meeting.meeting_notes ? 'Edit Notes' : 'Add Notes'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No meetings scheduled yet.</p>
        </div>
      )}
    </div>
  )
}
