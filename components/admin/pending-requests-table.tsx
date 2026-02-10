'use client'

import { useState } from 'react'
import { approveUser, denyUser } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  status: string
}

export function PendingRequestsTable({ users }: { users: Profile[] | null }) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleApprove = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }))

    const result = await approveUser(userId)

    if (result.success) {
      toast.success('User approved successfully!')
    } else {
      toast.error(result.error || 'Failed to approve user')
    }

    setLoadingStates((prev) => ({ ...prev, [userId]: false }))
  }

  const handleDeny = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, [userId]: true }))

    const result = await denyUser(userId)

    if (result.success) {
      toast.success('User denied')
    } else {
      toast.error(result.error || 'Failed to deny user')
    }

    setLoadingStates((prev) => ({ ...prev, [userId]: false }))
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No pending requests at this time.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.full_name || 'N/A'}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  Pending
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleApprove(user.id)}
                    disabled={loadingStates[user.id]}
                  >
                    {loadingStates[user.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeny(user.id)}
                    disabled={loadingStates[user.id]}
                  >
                    {loadingStates[user.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="mr-1 h-4 w-4" />
                        Deny
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
