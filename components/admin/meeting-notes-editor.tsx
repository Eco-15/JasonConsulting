'use client'

import { useState, useEffect } from 'react'
import { updateMeetingNotes } from '@/lib/actions/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface MeetingNotesEditorProps {
  meetingId: string
  initialNotes: string
  meetingStatus: string
}

export function MeetingNotesEditor({
  meetingId,
  initialNotes,
  meetingStatus,
}: MeetingNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setHasChanges(notes !== initialNotes)
  }, [notes, initialNotes])

  const handleSave = async () => {
    setSaving(true)

    const result = await updateMeetingNotes(meetingId, notes)

    if (result.success) {
      toast.success('Notes saved successfully!')
      setHasChanges(false)
    } else {
      toast.error(result.error || 'Failed to save notes')
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Notes</CardTitle>
        <CardDescription>
          Add private notes about this meeting. Only visible to admins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter meeting notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {hasChanges && 'Unsaved changes'}
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Notes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
