'use client'

import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function UnauthorizedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <Shield className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          Access Denied
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          You don&apos;t have permission to access this page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
          >
            Go Back
          </Button>

          <Button
            onClick={handleSignOut}
            className="silver-gradient-outline text-black"
          >
            Sign Out
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}
