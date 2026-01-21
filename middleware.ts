import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Try to get the user - this will automatically refresh the session if needed
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  // Also check session separately for debugging
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/auth')
  const isPublicPage = pathname === '/test-connection' || pathname === '/'

  // Log for debugging (only for important paths)
  if (process.env.NODE_ENV === 'development' && (isAuthPage || pathname.startsWith('/dashboard'))) {
    console.log('Middleware - Path:', pathname)
    console.log('Middleware - Session:', session ? `Valid (user: ${session.user.email})` : 'None/Invalid')
    console.log('Middleware - User:', user?.email || 'No user')
    if (authError && authError.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
      console.log('Middleware - Auth Error:', authError.message)
    }
  }

  // If no user and trying to access protected route, redirect to login
  if (!user && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user exists and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

