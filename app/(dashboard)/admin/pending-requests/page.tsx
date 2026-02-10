import { createClient } from '@/lib/supabase/server'
import { PendingRequestsTable } from '@/components/admin/pending-requests-table'

export default async function PendingRequestsPage() {
  const supabase = await createClient()

  const { data: pendingUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Requests</h1>
        <p className="text-muted-foreground">
          Review and approve new client registrations.
        </p>
      </div>

      <PendingRequestsTable users={pendingUsers} />
    </div>
  )
}
