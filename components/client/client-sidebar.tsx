'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/auth/auth-provider'
import {
  Calendar,
  FileText,
  Settings,
  LogOut,
  LayoutGrid,
} from 'lucide-react'

const clientNavItems = [
  {
    title: 'Book a Meeting',
    href: '/client/calendar',
    icon: Calendar,
  },
  {
    title: 'My Meetings',
    href: '/client/meetings',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/client/settings',
    icon: Settings,
  },
]

export function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user, profile } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="border-b p-6">
        <Link href="/" className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6" />
          <span className="text-xl font-semibold">Jason Graziani</span>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">Client Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {clientNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-white p-3">
          <p className="text-sm font-medium text-gray-900">
            {profile?.full_name || 'Client'}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
