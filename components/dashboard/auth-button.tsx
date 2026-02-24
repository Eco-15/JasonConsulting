'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthButton({ onHover }: { onHover?: () => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <Link
      href={user ? '/dashboard' : '/login'}
      className="relative z-50 cursor-pointer text-black hover:text-[#d4af37] transition-colors dark:text-white"
      onMouseEnter={onHover}
    >
      {user ? 'Dashboard' : 'Login'}
    </Link>
  )
}
