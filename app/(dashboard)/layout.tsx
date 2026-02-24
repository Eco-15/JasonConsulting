import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/supabase/auth-helpers'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getCurrentUserProfile()

  if (!result) {
    redirect('/login')
  }

  const { user, profile } = result

  // Redirect admins to admin dashboard
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="client"
        userName={profile.full_name || ''}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}
