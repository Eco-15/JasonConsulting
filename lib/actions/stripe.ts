'use server'

// NOTE: createBookingCheckout has been removed.
// Meeting booking now uses bookMeetingWithCredits from lib/actions/credits.ts.
// Package purchases use createConsultationCheckout / createSubscriptionCheckout
// from lib/actions/packages.ts.

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})
