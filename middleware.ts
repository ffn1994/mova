import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function cleanStr(s: string): string {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('')
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    cleanStr(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    cleanStr(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (!user && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register'],
}
