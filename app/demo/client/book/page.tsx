'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, FileText, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

// Demo pricing data
const pricing = [
  { duration_minutes: 30, price: 75 },
  { duration_minutes: 60, price: 150 },
  { duration_minutes: 90, price: 200 },
]

// Generate time slots (9 AM to 5 PM, every 30 minutes)
const timeSlots: { value: string; label: string }[] = []
for (let hour = 9; hour <= 17; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    if (hour === 17 && minute > 0) break
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    timeSlots.push({ value: timeString, label: displayTime })
  }
}

export default function DemoBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const selectedPricing = pricing.find((p) => p.duration_minutes === selectedDuration)

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isDateSelectable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date >= today
  }

  const handleDateClick = (day: number) => {
    if (isDateSelectable(day)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white h-screen sticky top-0">
          <div className="border-b p-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-900 rounded" />
              <span className="text-xl font-semibold">Jason Graziani</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Client Portal</p>
          </div>
          <nav className="p-4 space-y-1">
            <a href="/demo/client/book" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-white text-gray-900 shadow-sm">
              <Calendar className="h-5 w-5" />
              Book a Meeting
            </a>
            <a href="/demo/client" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <FileText className="h-5 w-5" />
              My Meetings
            </a>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">John Smith</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
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
                  <CardDescription>Choose your preferred date for the session.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-xs font-medium text-gray-500 py-2">
                        {day}
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

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Select Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
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
                      </div>

                      <div className="space-y-2">
                        <Label>Select Duration</Label>
                        <Select
                          value={selectedDuration?.toString()}
                          onValueChange={(value) => setSelectedDuration(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose duration" />
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
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Coaching Session Pricing</CardTitle>
                    <CardDescription>
                      Choose the session duration that best fits your needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pricing.map((price) => (
                      <div
                        key={price.duration_minutes}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{price.duration_minutes} Minutes</p>
                          <p className="text-sm text-gray-500">
                            {price.duration_minutes === 30 && 'Quick consultation'}
                            {price.duration_minutes === 60 && 'Standard session'}
                            {price.duration_minutes === 90 && 'Deep dive session'}
                          </p>
                        </div>
                        <p className="text-xl font-bold">${price.price}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {selectedDate && selectedTime && selectedPricing && (
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
                          {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' '}({selectedPricing.duration_minutes} minutes)
                        </span>
                      </div>
                      <div className="border-t pt-4 flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold">${selectedPricing.price}</span>
                      </div>
                      <Button className="w-full">
                        Confirm Booking
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
