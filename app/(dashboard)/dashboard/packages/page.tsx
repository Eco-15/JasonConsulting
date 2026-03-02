import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/auth-helpers'
import { redirect } from 'next/navigation'
import { PackagesBrowser } from './packages-browser'

export default async function PackagesPage() {
  const result = await getCurrentUserProfile()
  if (!result) redirect('/login')

  const supabase = await createClient()

  const [{ data: packages }, { data: profile }, { data: subscription }] =
    await Promise.all([
      supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', result.user.id)
        .single(),
      supabase
        .from('client_subscriptions')
        .select('*, packages(*)')
        .eq('client_id', result.user.id)
        .eq('status', 'active')
        .maybeSingle(),
    ])

  return (
    <PackagesBrowser
      packages={packages ?? []}
      creditsBalance={profile?.credits_balance ?? 0}
      activeSubscription={subscription as (typeof subscription & { packages: NonNullable<typeof packages>[0] }) | null}
    />
  )
}
