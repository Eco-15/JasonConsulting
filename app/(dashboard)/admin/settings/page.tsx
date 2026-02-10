'use client'

import { useUser } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminSettingsPage() {
  const { user, profile } = useUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your admin account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile?.full_name || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {profile?.role || 'Admin'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Member Since</Label>
            <Input
              value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
