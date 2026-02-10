'use client'

import { useUser } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PendingApprovalPage() {
  const { user, profile } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 gold-gradient rounded-full mb-6">
          <Clock className="h-10 w-10 text-gray-900" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="gold-gradient-text">Awaiting Approval</span>
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Thank you for registering! Your account is pending admin approval.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
            <Mail className="h-5 w-5" />
            <span className="font-medium">{user?.email}</span>
          </div>
          <p className="text-sm text-gray-500">
            You&apos;ll receive an email notification once your account has been approved.
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          This usually takes 1-2 business days. If you have any questions, please contact support.
        </p>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
