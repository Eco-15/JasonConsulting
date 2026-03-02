import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

// Service-role client — bypasses RLS, safe for server-only webhook use
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { client_id, package_id } = session.metadata ?? {}

        if (!client_id || !package_id) break

        // Idempotency: skip if already processed
        const { data: existing } = await supabase
          .from('credit_transactions')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle()

        if (existing) break

        const { data: pkg } = await supabase
          .from('packages')
          .select('credits_granted, name')
          .eq('id', package_id)
          .single()

        if (!pkg) break

        if (session.mode === 'payment') {
          // One-time consultation purchase
          await supabase.rpc('add_credits', {
            p_client_id: client_id,
            p_credits: pkg.credits_granted,
            p_transaction_type: 'purchase',
            p_package_id: package_id,
            p_stripe_session_id: session.id,
            p_description: `Purchased ${pkg.name}`,
          })
        } else if (session.mode === 'subscription') {
          // Initial subscription payment — create subscription record + add credits
          const stripeSubId = session.subscription as string
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as unknown as { current_period_start: number; current_period_end: number }

          await supabase
            .from('client_subscriptions')
            .upsert({
              client_id,
              package_id,
              stripe_subscription_id: stripeSubId,
              stripe_customer_id: session.customer as string,
              status: 'active',
              current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'stripe_subscription_id' })

          await supabase.rpc('add_credits', {
            p_client_id: client_id,
            p_credits: pkg.credits_granted,
            p_transaction_type: 'purchase',
            p_package_id: package_id,
            p_stripe_session_id: session.id,
            p_description: `Initial subscription: ${pkg.name}`,
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        // Cast to a loose type — the Stripe 2026 SDK has different typings for Invoice
        const invoice = event.data.object as unknown as {
          id: string
          billing_reason: string
          subscription: string | null
        }
        // Only process recurring renewals, not the first invoice
        if (invoice.billing_reason !== 'subscription_cycle') break

        const stripeSubId = invoice.subscription as string

        // Idempotency check
        const { data: existingTx } = await supabase
          .from('credit_transactions')
          .select('id')
          .eq('stripe_invoice_id', invoice.id)
          .maybeSingle()

        if (existingTx) break

        const { data: sub } = await supabase
          .from('client_subscriptions')
          .select('*, packages(credits_granted, name)')
          .eq('stripe_subscription_id', stripeSubId)
          .single()

        if (!sub) break

        const pkg = sub.packages as { credits_granted: number; name: string }

        // Update period dates
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as unknown as { current_period_start: number; current_period_end: number }
        await supabase
          .from('client_subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubId)

        await supabase.rpc('add_credits', {
          p_client_id: sub.client_id,
          p_credits: pkg.credits_granted,
          p_transaction_type: 'subscription_renewal',
          p_package_id: sub.package_id,
          p_stripe_invoice_id: invoice.id,
          p_description: `Subscription renewal: ${pkg.name}`,
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { subscription: string | null }
        await supabase
          .from('client_subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', invoice.subscription as string)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as unknown as { id: string; status: string; current_period_end: number }
        const statusMap: Record<string, string> = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'cancelled',
          unpaid: 'unpaid',
          trialing: 'trialing',
        }
        await supabase
          .from('client_subscriptions')
          .update({
            status: statusMap[sub.status] ?? sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as unknown as { id: string }
        await supabase
          .from('client_subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
