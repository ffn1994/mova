'use client'

// Patch window.fetch globally so non-ISO-8859-1 chars are stripped from
// every header value before they reach the network.
// This catches BOM characters injected by mobile keyboards / password managers
// that would otherwise cause "String contains non ISO-8859-1 code point" errors.

function cleanStr(s: string): string {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('')
}

function sanitizeHeaders(headers: HeadersInit | undefined): HeadersInit | undefined {
  if (!headers) return headers
  const out: Record<string, string> = {}
  if (headers instanceof Headers) {
    headers.forEach((v, k) => { out[cleanStr(k)] = cleanStr(v) })
  } else if (Array.isArray(headers)) {
    for (const [k, v] of headers) out[cleanStr(k)] = cleanStr(v)
  } else {
    for (const [k, v] of Object.entries(headers as Record<string, string>)) {
      out[cleanStr(k)] = cleanStr(v)
    }
  }
  return out
}

if (typeof window !== 'undefined') {
  const _fetch = window.fetch.bind(window)
  window.fetch = function patchedFetch(input, init) {
    if (init?.headers) {
      init = { ...init, headers: sanitizeHeaders(init.headers) }
    }
    return _fetch(input, init)
  }
}
