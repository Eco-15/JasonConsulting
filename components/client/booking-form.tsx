'use client'

import { useState } from 'react'
import { bookMeeting } from '@/lib/actions/meetings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Calendar, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookingFormProps {
  clientId: string
  pricing: Array<{
    duration_minutes: number
    price: number
    is_active: boolean
  }>
}

export function BookingForm({ clientId, pricing }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)

  const selectedPricing = pricing.find((p) => p.duration_minutes === selectedDuration)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime || !selectedDuration || !selectedPricing) {
      toast.error('Please fill in all fields')
      return
    }

    // Combine date and time
    const startDateTime = new Date(`${selectedDate}T${selectedTime}`)
    const endDateTime = new Date(startDateTime.getTime() + selectedDuration * 60000)

    // Check if date is in the past
    if (startDateTime < new Date()) {
      toast.error('Cannot book meetings in the past')
      return
    }

    setLoading(true)

    const result = await bookMeeting({
      clientId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      durationMinutes: selectedDuration,
      price: selectedPricing.price,
    })

    if (result.success) {
      toast.success('Meeting booked successfully!')
      router.push('/client/meetings')
    } else {
      toast.error(result.error || 'Failed to book meeting')
    }

    setLoading(false)
  }

  // Generate time slots (9 AM to 5 PM, every 30 minutes)
  const timeSlots = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 0) break // Stop at 5:00 PM
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
      timeSlots.push({ value: timeString, label: displayTime })
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Your Session</CardTitle>
        <CardDescription>
          Select your preferred date, time, and duration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={selectedDuration?.toString()}
              onValueChange={(value) => setSelectedDuration(Number(value))}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {pricing.map((price) => (
                  <SelectItem
                    key={price.duration_minutes}
                    value={price.duration_minutes.toString()}
                  >
                    {price.duration_minutes} minutes - ${price.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPricing && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Price:</span>
                <span className="text-2xl font-bold">${selectedPricing.price}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Payment will be collected after the session.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !selectedDate || !selectedTime || !selectedDuration}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
