'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import {
  Calendar,
  FileText,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  DollarSign,
  LogOut,
  LayoutGrid,
} from 'lucide-react'
import type { UserRole } from '@/lib/types/database'

const clientNavItems = [
  {
    title: 'Book a Meeting',
    href: '/dashboard/book',
    icon: Calendar,
  },
  {
    title: 'My Meetings',
    href: '/dashboard',
    icon: FileText,
  },
]

const adminNavItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: CalendarCheck,
  },
  {
    title: 'Availability',
    href: '/admin/availability',
    icon: Clock,
  },
  {
    title: 'Pricing',
    href: '/admin/pricing',
    icon: DollarSign,
  },
]

interface SidebarProps {
  role: UserRole
  userName: string
  userEmail: string
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNavItems : clientNavItems
  const portalLabel = role === 'admin' ? 'Admin Panel' : 'Client Portal'

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <Link href="/" className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6" />
          <span className="text-xl font-semibold">Jason Graziani</span>
        </Link>
        <p className="mt-2 text-sm text-gray-500">{portalLabel}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard' || item.href === '/admin'
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        <div className="mb-3 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">
            {userName || 'User'}
          </p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        <form action={signOut}>
          <Button variant="outline" className="w-full" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
