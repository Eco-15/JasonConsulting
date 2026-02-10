import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user session
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single()

        // Redirect based on role
        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        if (profile?.role === 'client') {
          return NextResponse.redirect(`${origin}/client/meetings`)
        }
      }
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
