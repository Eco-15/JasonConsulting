import Stripe from 'stripe'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { createMeetingEvent } from '@/lib/google/calendar'
import SuccessView from './success-view'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-gray-600">{message}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/book">Try booking again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <ErrorCard message="No booking session found." />
  }

  // Verify payment with Stripe
  let stripeSession: Stripe.Checkout.Session
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    })
  } catch {
    return <ErrorCard message="Could not verify your payment. Please contact support." />
  }

  if (stripeSession.payment_status !== 'paid') {
    return <ErrorCard message="Payment was not completed. Please try booking again." />
  }

  const { date, time, pricing_tier_id, client_id, client_notes } =
    stripeSession.metadata ?? {}

  if (!date || !time || !pricing_tier_id || !client_id) {
    return <ErrorCard message="Booking details are missing. Please contact support." />
  }

  const supabase = await createClient()

  // Always fetch client profile for the display
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', client_id)
    .single()

  const clientName = clientProfile?.full_name || clientProfile?.email || 'there'

  // Idempotency: return existing meeting if success page is refreshed
  const { data: existing } = await supabase
    .from('meetings')
    .select('*')
    .eq('stripe_session_id', session_id)
    .single()

  let meeting = existing

  if (!meeting) {
    // Fetch pricing tier
    const { data: tier } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('id', pricing_tier_id)
      .single()

    if (!tier || !clientProfile) {
      return <ErrorCard message="Could not load booking details. Please contact support." />
    }

    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + tier.duration_minutes * 60 * 1000)

    const eventTitle = `${tier.label}: Jason Graziani <> ${clientName}`

    // Create Google Calendar event with Meet link
    let meetUrl: string | null = null
    try {
      meetUrl = await createMeetingEvent({
        title: eventTitle,
        startTime,
        endTime,
        clientEmail: clientProfile.email,
        notes: client_notes || undefined,
      })
    } catch (err) {
      console.error('Google Meet creation failed:', err)
    }

    // Create meeting record in Supabase
    const { data: created } = await supabase
      .from('meetings')
      .insert({
        client_id,
        title: 'Coaching Session',
        start_time: startTime.toISOString(),
        duration_minutes: tier.duration_minutes,
        price: tier.price,
        status: 'scheduled',
        client_notes: client_notes || null,
        stripe_session_id: session_id,
        meet_url: meetUrl,
      })
      .select()
      .single()

    meeting = created
  }

  // Format for display
  const startTime = new Date(`${date}T${time}:00`)
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <SuccessView
      clientName={clientName}
      formattedDate={formattedDate}
      formattedTime={formattedTime}
      meetUrl={meeting?.meet_url ?? null}
    />
  )
}
