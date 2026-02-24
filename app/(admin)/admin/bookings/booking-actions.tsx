'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateMeetingStatus, addMeetingNotes } from '@/lib/actions/meetings'
import { toast } from 'sonner'
import type { MeetingStatus } from '@/lib/types/database'
import { CheckCircle, X, AlertTriangle, FileEdit } from 'lucide-react'

interface BookingActionsProps {
  meetingId: string
  currentStatus: MeetingStatus
  meetingNotes: string
}

export function BookingActions({
  meetingId,
  currentStatus,
  meetingNotes,
}: BookingActionsProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(meetingNotes)
  const [loading, setLoading] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  const handleStatusUpdate = async (status: MeetingStatus) => {
    setLoading(true)
    const result = await updateMeetingStatus(meetingId, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Meeting marked as ${status}`)
      router.refresh()
    }
    setLoading(false)
  }

  const handleSaveNotes = async () => {
    setLoading(true)
    const result = await addMeetingNotes(meetingId, notes)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Notes saved')
      setNotesOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  if (currentStatus === 'cancelled') return null

  return (
    <div className="flex items-center justify-end gap-1">
      {currentStatus === 'scheduled' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusUpdate('completed')}
            disabled={loading}
            title="Mark as completed"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusUpdate('no_show')}
            disabled={loading}
            title="Mark as no-show"
          >
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={loading}
            title="Cancel meeting"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Meeting notes">
            <FileEdit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meeting Notes</DialogTitle>
            <DialogDescription>
              Add or edit notes for this meeting.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter meeting notes..."
            rows={6}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={loading}>
              {loading ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
