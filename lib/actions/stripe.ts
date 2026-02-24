'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { bookMeetingSchema } from '@/lib/validations/meetings'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function createBookingCheckout(formData: {
  date: string
  time: string
  pricing_tier_id: string
  client_notes?: string
}) {
  const parsed = bookMeetingSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch live price from DB — never trust client-supplied price
  const { data: tier } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('id', parsed.data.pricing_tier_id)
    .eq('is_active', true)
    .single()

  if (!tier) {
    return { error: 'Invalid pricing tier' }
  }

  const startTime = new Date(`${parsed.data.date}T${parsed.data.time}:00`)
  const endTime = new Date(startTime.getTime() + tier.duration_minutes * 60 * 1000)

  // Conflict check
  const { data: conflicts } = await supabase
    .from('meetings')
    .select('id')
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt('start_time', new Date(startTime.getTime() - 180 * 60 * 1000).toISOString())

  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot is no longer available. Please choose another.' }
  }

  // Blocked date check
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', parsed.data.date)
    .single()

  if (blocked) {
    return { error: 'This date is not available for bookings.' }
  }

  // Availability check
  const dayOfWeek = startTime.getDay()
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!availability) {
    return { error: 'No availability on this day.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(tier.price * 100),
          product_data: {
            name: `${tier.duration_minutes}-Minute Coaching Session`,
            description: tier.label,
          },
        },
      },
    ],
    metadata: {
      date: parsed.data.date,
      time: parsed.data.time,
      pricing_tier_id: parsed.data.pricing_tier_id,
      client_id: user.id,
      client_notes: parsed.data.client_notes || '',
    },
    success_url: `${siteUrl}/dashboard/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/dashboard/book`,
  })

  redirect(session.url!)
}
