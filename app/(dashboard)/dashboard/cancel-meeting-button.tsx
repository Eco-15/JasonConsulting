'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cancelMeeting } from '@/lib/actions/meetings'
import { RescheduleMeetingDialog } from './reschedule-meeting-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { Meeting } from '@/lib/types/database'

export function MeetingActions({ meeting }: { meeting: Meeting }) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    setCancelling(true)
    const result = await cancelMeeting(meeting.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Meeting cancelled.')
      setCancelOpen(false)
      router.refresh()
    }
    setCancelling(false)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setRescheduleOpen(true)}
        >
          Reschedule
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setCancelOpen(true)}
        >
          Cancel
        </Button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this meeting?</DialogTitle>
            <DialogDescription className="pt-1">
              This cancellation is <strong>non-refundable</strong>. Your payment will not be
              returned. If you&apos;d like to keep your session, use &quot;Reschedule&quot; instead.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>
              Go Back
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel (No Refund)'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <RescheduleMeetingDialog
        meetingId={meeting.id}
        durationMinutes={meeting.duration_minutes}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
      />
    </>
  )
}
