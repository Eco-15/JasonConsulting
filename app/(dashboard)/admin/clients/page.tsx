import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage your approved clients.
        </p>
      </div>

      {clients && clients.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No clients yet.</p>
        </div>
      )}
    </div>
  )
}
