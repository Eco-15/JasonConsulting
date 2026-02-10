import { createClient } from '@/lib/supabase/server'
import { BookingForm } from '@/components/client/booking-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPricing } from '@/lib/actions/meetings'

export default async function ClientCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pricing = await getPricing()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book a Meeting</h1>
        <p className="text-muted-foreground">
          Schedule your next coaching session with Jason Graziani.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BookingForm clientId={user.id} pricing={pricing} />

        <Card>
          <CardHeader>
            <CardTitle>Coaching Session Pricing</CardTitle>
            <CardDescription>
              Choose the session duration that best fits your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricing.map((price: any) => (
              <div
                key={price.duration_minutes}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{price.duration_minutes} Minutes</p>
                  <p className="text-sm text-muted-foreground">
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
      </div>
    </div>
  )
}
