'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  updateAvailability,
  addBlockedDate,
  removeBlockedDate,
} from '@/lib/actions/availability'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, X, Plus } from 'lucide-react'
import type { Availability, BlockedDate } from '@/lib/types/database'

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export default function AvailabilityPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [newBlockedReason, setNewBlockedReason] = useState('')
  const [addingBlock, setAddingBlock] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [{ data: avail }, { data: blocked }] = await Promise.all([
        supabase.from('availability').select('*').order('day_of_week'),
        supabase
          .from('blocked_dates')
          .select('*')
          .order('blocked_date', { ascending: true }),
      ])

      if (avail && avail.length > 0) {
        setSlots(
          avail.map((a) => ({
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            is_available: a.is_available,
          }))
        )
      } else {
        // Initialize with defaults
        setSlots(
          DAY_NAMES.map((_, i) => ({
            day_of_week: i,
            start_time: '09:00',
            end_time: '17:00',
            is_available: i >= 1 && i <= 5,
          }))
        )
      }

      setBlockedDates(blocked ?? [])
      setLoading(false)
    }
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleDay = (dayOfWeek: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.day_of_week === dayOfWeek
          ? { ...s, is_available: !s.is_available }
          : s
      )
    )
  }

  const handleTimeChange = (
    dayOfWeek: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s
      )
    )
  }

  const handleSaveSchedule = async () => {
    setSaving(true)
    const result = await updateAvailability(slots)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Schedule updated!')
    }
    setSaving(false)
  }

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate) return
    setAddingBlock(true)
    const result = await addBlockedDate(newBlockedDate, newBlockedReason || undefined)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Date blocked')
      // Refresh blocked dates
      const { data } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true })
      setBlockedDates(data ?? [])
      setNewBlockedDate('')
      setNewBlockedReason('')
    }
    setAddingBlock(false)
  }

  const handleRemoveBlockedDate = async (id: string) => {
    const result = await removeBlockedDate(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setBlockedDates((prev) => prev.filter((b) => b.id !== id))
      toast.success('Date unblocked')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
        <p className="text-gray-500">
          Set your weekly schedule and block specific dates.
        </p>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {slots.map((slot) => (
            <div
              key={slot.day_of_week}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="w-28">
                <button
                  onClick={() => handleToggleDay(slot.day_of_week)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    slot.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {DAY_NAMES[slot.day_of_week]}
                </button>
              </div>
              {slot.is_available ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) =>
                      handleTimeChange(
                        slot.day_of_week,
                        'start_time',
                        e.target.value
                      )
                    }
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) =>
                      handleTimeChange(
                        slot.day_of_week,
                        'end_time',
                        e.target.value
                      )
                    }
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unavailable</span>
              )}
            </div>
          ))}
          <Button onClick={handleSaveSchedule} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                placeholder="e.g. Holiday, vacation"
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddBlockedDate}
              disabled={!newBlockedDate || addingBlock}
            >
              <Plus className="mr-2 h-4 w-4" />
              Block Date
            </Button>
          </div>

          {blockedDates.length > 0 ? (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {new Date(blocked.blocked_date + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </Badge>
                    {blocked.reason && (
                      <span className="text-sm text-gray-500">
                        {blocked.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlockedDate(blocked.id)}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No blocked dates.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
