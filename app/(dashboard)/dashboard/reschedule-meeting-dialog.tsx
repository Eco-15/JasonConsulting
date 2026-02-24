'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAvailableSlots } from '@/lib/actions/availability'
import { rescheduleMeeting } from '@/lib/actions/meetings'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Availability, BlockedDate } from '@/lib/types/database'

interface RescheduleMeetingDialogProps {
  meetingId: string
  durationMinutes: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RescheduleMeetingDialog({
  meetingId,
  durationMinutes,
  open,
  onOpenChange,
}: RescheduleMeetingDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  const [availability, setAvailability] = useState<Availability[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch availability and blocked dates when dialog opens
  useEffect(() => {
    if (!open) return

    async function fetchData() {
      setLoadingData(true)
      const [{ data: avail }, { data: blocked }] = await Promise.all([
        supabase.from('availability').select('*'),
        supabase.from('blocked_dates').select('*'),
      ])
      setAvailability(avail ?? [])
      setBlockedDates(blocked ?? [])
      setLoadingData(false)
    }
    fetchData()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([])
      return
    }

    async function fetchSlots() {
      setLoadingSlots(true)
      setSelectedTime('')
      const dateStr = formatDate(selectedDate!)
      const result = await getAvailableSlots(dateStr, durationMinutes)
      setTimeSlots(result.data ?? [])
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [selectedDate, durationMinutes])

  // Calendar helpers
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { daysInMonth, startingDay } = (() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() }
  })()

  function formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  function isDateSelectable(day: number) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (date < today) return false
    const dayOfWeek = date.getDay()
    const hasAvailability = availability.some((a) => a.day_of_week === dayOfWeek && a.is_available)
    if (!hasAvailability) return false
    const dateStr = formatDate(date)
    return !blockedDates.some((b) => b.blocked_date === dateStr)
  }

  function isSelectedDate(day: number) {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  function handleDateClick(day: number) {
    if (isDateSelectable(day)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    }
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    const result = await rescheduleMeeting(meetingId, formatDate(selectedDate), selectedTime)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Meeting rescheduled! A new calendar invite has been sent.')
      onOpenChange(false)
      router.refresh()
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Meeting</DialogTitle>
          <DialogDescription>
            Pick a new date and time. Your Google Calendar invite will be updated automatically.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold text-sm">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-xs font-medium text-gray-500 py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const selectable = isDateSelectable(day)
                const selected = isSelectedDate(day)
                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={!selectable}
                    className={`
                      p-1.5 text-sm rounded-lg transition-colors
                      ${selected ? 'bg-gray-900 text-white' : ''}
                      ${selectable && !selected ? 'hover:bg-gray-100' : ''}
                      ${!selectable ? 'text-gray-300 cursor-not-allowed' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Times</p>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading times...
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTime(slot.value)}
                        className={`
                          py-2 px-3 text-sm rounded-lg border transition-colors
                          ${selectedTime === slot.value
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'hover:bg-gray-50 border-gray-200'
                          }
                        `}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No available times on this date.</p>
                )}
              </div>
            )}

            {/* Confirm */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Go Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedDate || !selectedTime || submitting}
                onClick={handleConfirm}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
