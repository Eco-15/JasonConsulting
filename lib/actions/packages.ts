'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function createConsultationCheckout(packageId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: pkg } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .eq('package_type', 'consultation')
    .eq('is_active', true)
    .single()

  if (!pkg) return { error: 'Package not found' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pkg.price_cents,
          product_data: {
            name: pkg.name,
            description: pkg.description ?? `${pkg.credits_granted} credits (${pkg.credits_granted} minutes of consultation)`,
          },
        },
      },
    ],
    metadata: {
      client_id: user.id,
      package_id: packageId,
    },
    success_url: `${siteUrl}/dashboard/packages/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/dashboard/packages`,
  })

  redirect(session.url!)
}

export async function createSubscriptionCheckout(packageId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: pkg } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .eq('package_type', 'membership')
    .eq('is_active', true)
    .single()

  if (!pkg) return { error: 'Package not found' }

  // Prevent duplicate subscriptions
  const { data: existingSub } = await supabase
    .from('client_subscriptions')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingSub) return { error: 'You already have an active subscription. Cancel it first.' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Determine billing interval
  const intervalMap: Record<string, { interval: 'month'; interval_count: number }> = {
    monthly: { interval: 'month', interval_count: 1 },
    bimonthly: { interval: 'month', interval_count: 2 },
    quarterly: { interval: 'month', interval_count: 3 },
  }
  const billingInterval = intervalMap[pkg.billing_period]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: pkg.price_cents,
          recurring: billingInterval,
          product_data: {
            name: pkg.name,
            description: pkg.description ?? `${pkg.credits_granted} credits per billing period`,
          },
        },
      },
    ],
    metadata: {
      client_id: user.id,
      package_id: packageId,
    },
    subscription_data: {
      metadata: {
        client_id: user.id,
        package_id: packageId,
      },
    },
    success_url: `${siteUrl}/dashboard/packages/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/dashboard/packages`,
  })

  redirect(session.url!)
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: sub } = await supabase
    .from('client_subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .eq('client_id', user.id)
    .single()

  if (!sub) return { error: 'Subscription not found' }

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  await supabase
    .from('client_subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId)

  return { success: true }
}

export async function getClientCreditsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { creditsBalance: 0, transactions: [], activeSubscription: null }

  const [{ data: profile }, { data: transactions }, { data: subscription }] =
    await Promise.all([
      supabase.from('profiles').select('credits_balance').eq('id', user.id).single(),
      supabase
        .from('credit_transactions')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('client_subscriptions')
        .select('*, packages(*)')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .maybeSingle(),
    ])

  return {
    creditsBalance: profile?.credits_balance ?? 0,
    transactions: transactions ?? [],
    activeSubscription: subscription ?? null,
  }
}
