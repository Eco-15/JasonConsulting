import Stripe from 'stripe'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import PackagePurchaseSuccessView from './success-view'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-gray-600">{message}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/packages">Back to Packages</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PackagePurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <ErrorCard message="No session found." />
  }

  let stripeSession: Stripe.Checkout.Session
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return <ErrorCard message="Could not verify your purchase. Please contact support." />
  }

  if (stripeSession.payment_status !== 'paid' && stripeSession.status !== 'complete') {
    return <ErrorCard message="Payment was not completed. Please try again." />
  }

  const clientId = stripeSession.metadata?.client_id
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, credits_balance')
    .eq('id', clientId ?? '')
    .single()

  return (
    <PackagePurchaseSuccessView
      clientName={profile?.full_name || 'there'}
      creditsBalance={profile?.credits_balance ?? 0}
      isSubscription={stripeSession.mode === 'subscription'}
    />
  )
}
