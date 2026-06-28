import { createBrowserClient } from '@supabase/ssr'

function cleanStr(s: string): string {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('')
}

function cleanHeaders(headers: HeadersInit | undefined): HeadersInit | undefined {
  if (!headers) return headers
  const cleaned: Record<string, string> = {}
  const entries = headers instanceof Headers
    ? Array.from(headers.entries())
    : Object.entries(headers as Record<string, string>)
  for (const [k, v] of entries) {
    cleaned[cleanStr(k)] = cleanStr(v)
  }
  return cleaned
}

const safeFetch: typeof fetch = (input, init) => {
  if (init) {
    init = { ...init, headers: cleanHeaders(init.headers) }
  }
  return fetch(input, init)
}

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  const url = cleanStr(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  const key = cleanStr(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
  client = createBrowserClient(url, key, {
    global: { fetch: safeFetch },
  })
  return client
}
