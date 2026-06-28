'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from '@/actions/auth'
import { useLanguage } from '@/context/LanguageContext'

function sanitize(s: string) {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('').trim()
}

export function LoginForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const { t, lang, setLang, isRTL } = useLanguage()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = e.currentTarget
    const email = sanitize((form.elements.namedItem('email') as HTMLInputElement).value)
    const password = sanitize((form.elements.namedItem('password') as HTMLInputElement).value)

    // Sanitize client-side first (removes BOM / non-ISO-8859-1 chars),
    // then call the server action with clean ASCII-only strings.
    const result = await signIn(email, password)

    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
    // On success, signIn() does redirect('/app/dashboard') server-side —
    // no client-side navigation needed.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-in-up" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('welcomeBack')}</h2>
          <p className="text-sm mt-1" style={{ color: '#B3B3B3' }}>
            {isRTL ? 'سجّل دخولك لمتابعة رحلتك' : 'Sign in to continue your journey'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg mt-1"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#22C55E' }}
        >
          {lang === 'en' ? 'عربي' : 'EN'}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">{t('email')}</label>
          <input
            id="email" name="email" type="email"
            placeholder={t('emailPlaceholder')}
            required autoComplete="email"
            className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all focus:ring-2"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', '--tw-ring-color': '#22C55E' } as React.CSSProperties}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">{t('password')}</label>
            <Link href="/forgot-password" className="text-xs font-medium" style={{ color: '#22C55E' }}>
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password" name="password" type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              required autoComplete="current-password"
              className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all focus:ring-2"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', '--tw-ring-color': '#22C55E' } as React.CSSProperties}
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#666' }}>
              {showPass
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}>
        {pending ? t('loading') : t('signIn')}
      </button>

      <p className="text-center text-sm" style={{ color: '#B3B3B3' }}>
        {t('noAccount')}{' '}
        <Link href="/register" className="font-semibold" style={{ color: '#22C55E' }}>
          {t('signUpLink')}
        </Link>
      </p>
    </form>
  )
}
