'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelMeeting } from '@/lib/actions/meetings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CancelMeetingButton({ meetingId }: { meetingId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    setLoading(true)
    const result = await cancelMeeting(meetingId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Meeting cancelled successfully.')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? 'Cancelling...' : 'Cancel Meeting'}
    </Button>
  )
}
