import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function cleanStr(s: string): string {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('')
}

export async function createClient() {
  const cookieStore = await cookies()
  const url = cleanStr(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  const key = cleanStr(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')

  return createServerClient(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies can't be set, middleware handles refresh
          }
        },
      },
    }
  )
}
