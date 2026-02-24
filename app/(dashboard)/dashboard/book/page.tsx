'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAvailableSlots } from '@/lib/actions/availability'
import { createBookingCheckout } from '@/lib/actions/stripe'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PricingTier, Availability, BlockedDate } from '@/lib/types/database'

export default function BookMeetingPage() {
  const supabase = createClient()

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTierId, setSelectedTierId] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)

  const selectedTier = pricingTiers.find((t) => t.id === selectedTierId)

  // Fetch pricing, availability, and blocked dates on mount
  useEffect(() => {
    async function fetchData() {
      const [{ data: tiers }, { data: avail }, { data: blocked }] =
        await Promise.all([
          supabase
            .from('pricing_tiers')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase.from('availability').select('*'),
          supabase.from('blocked_dates').select('*'),
        ])

      setPricingTiers(tiers ?? [])
      setAvailability(avail ?? [])
      setBlockedDates(blocked ?? [])
      setLoading(false)
    }
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch available time slots when date or tier changes
  useEffect(() => {
    if (!selectedDate || !selectedTier) {
      setTimeSlots([])
      return
    }

    async function fetchSlots() {
      setLoadingSlots(true)
      setSelectedTime('')
      const dateStr = `${selectedDate!.getFullYear()}-${String(selectedDate!.getMonth() + 1).padStart(2, '0')}-${String(selectedDate!.getDate()).padStart(2, '0')}`
      const result = await getAvailableSlots(dateStr, selectedTier!.duration_minutes)
      setTimeSlots(result.data ?? [])
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [selectedDate, selectedTier]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateSelectable = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (date < today) return false

    // Check if the day of week has availability
    const dayOfWeek = date.getDay()
    const hasAvailability = availability.some(
      (a) => a.day_of_week === dayOfWeek && a.is_available
    )
    if (!hasAvailability) return false

    // Check if the date is blocked
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const isBlocked = blockedDates.some((b) => b.blocked_date === dateStr)
    if (isBlocked) return false

    return true
  }

  const handleDateClick = (day: number) => {
    if (isDateSelectable(day)) {
      setSelectedDate(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      )
    }
  }

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedTierId) return

    setBooking(true)
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

    const result = await createBookingCheckout({
      date: dateStr,
      time: selectedTime,
      pricing_tier_id: selectedTierId,
      client_notes: clientNotes || undefined,
    })

    // Only reached if redirect didn't happen (i.e. an error was returned)
    if (result?.error) {
      toast.error(result.error)
      setBooking(false)
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
        <h1 className="text-3xl font-bold tracking-tight">Book a Meeting</h1>
        <p className="text-gray-500">
          Schedule your next coaching session with Jason Graziani.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>
              Choose your preferred date for the session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day) => (
                  <div
                    key={day}
                    className="text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                )
              )}
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
                      p-2 text-sm rounded-lg transition-colors
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

            {/* Duration Selection */}
            {selectedDate && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Select Duration</Label>
                  <Select
                    value={selectedTierId}
                    onValueChange={setSelectedTierId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.duration_minutes} minutes - ${tier.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                {selectedTier && (
                  <div className="space-y-2">
                    <Label>Select Time</Label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading available times...
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <Select
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">
                        No available time slots for this date and duration.
                      </p>
                    )}
                  </div>
                )}

                {/* Client Notes */}
                {selectedTime && (
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Anything you'd like to discuss..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Pricing + Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coaching Session Pricing</CardTitle>
              <CardDescription>
                Choose the session duration that best fits your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{tier.duration_minutes} Minutes</p>
                    <p className="text-sm text-gray-500">
                      {tier.label}
                    </p>
                  </div>
                  <p className="text-xl font-bold">${tier.price}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {selectedDate && selectedTime && selectedTier && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {selectedDate.toLocaleDateString('en-US', {
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
                    {new Date(
                      `2000-01-01T${selectedTime}`
                    ).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    ({selectedTier.duration_minutes} minutes)
                  </span>
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold">
                    ${selectedTier.price}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
