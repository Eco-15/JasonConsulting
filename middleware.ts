import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Public paths that don't require authentication
const publicPaths = ['/', '/login', '/contact', '/demo', '/pending-approval', '/unauthorized']

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Check if path is public
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith('/auth/')
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Allow access to public paths
  if (isPublicPath) {
    // If user is logged in and tries to access login page, redirect to dashboard
    if (session && request.nextUrl.pathname === '/login') {
      // Fetch user profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // All clients (pending or approved) go to client portal
      if (profile?.role === 'client') {
        return NextResponse.redirect(new URL('/client/meetings', request.url))
      }
    }
    return response
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', session.user.id)
    .single()

  // Check if user is denied
  if (profile?.status === 'denied') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Check admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    return response
  }

  // Check client routes - allow both pending and approved clients
  if (request.nextUrl.pathname.startsWith('/client')) {
    if (profile?.role !== 'client') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
