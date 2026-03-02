'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { CheckCircle, Zap, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PackagePurchaseSuccessViewProps {
  clientName: string
  creditsBalance: number
  isSubscription: boolean
}

export default function PackagePurchaseSuccessView({
  clientName,
  creditsBalance,
  isSubscription,
}: PackagePurchaseSuccessViewProps) {
  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'],
      })
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
            {isSubscription ? 'Subscription Active' : 'Purchase Complete'}
          </p>
          <CardTitle className="text-3xl font-bold">{clientName}!</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            {isSubscription
              ? 'Your membership is now active. Credits have been added to your account.'
              : 'Your credits have been added to your account.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 pb-8">
          <div className="rounded-xl border bg-gray-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Current Credit Balance</span>
            </div>
            <span className="text-2xl font-bold">{creditsBalance}</span>
          </div>

          <Button asChild className="w-full gap-2">
            <Link href="/dashboard/book">
              <Calendar className="h-4 w-4" />
              Book a Session
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
