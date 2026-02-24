'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { CheckCircle, Video, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SuccessViewProps {
  clientName: string
  formattedDate: string
  formattedTime: string
  meetUrl: string | null
}

export default function SuccessView({
  clientName,
  formattedDate,
  formattedTime,
  meetUrl,
}: SuccessViewProps) {
  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      // Left side burst
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'],
      })
      // Right side burst
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2 pt-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">
            Congratulations
          </p>
          <CardTitle className="text-3xl font-bold">{clientName}!</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Your session with Jason Graziani is booked.
            <br />
            A Google Calendar invite is on its way to your inbox.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 pb-8">
          <div className="rounded-xl border bg-gray-50 p-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="font-medium">{formattedTime}</span>
            </div>
          </div>

          {meetUrl && (
            <Button asChild className="w-full gap-2">
              <a href={meetUrl} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" />
                Join Google Meet
              </a>
            </Button>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
