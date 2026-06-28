'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/Button'

interface Props {
  userEmail: string | undefined
}

export function ClientSidebar({ userEmail }: Props) {
  const { t, lang, setLang } = useLanguage()
  const pathname = usePathname()

  const navLinks = [
    { href: '/app/dashboard', label: t('dashboard') },
    { href: '/app/coach', label: t('aiCoach') },
    { href: '/app/chat', label: t('chat') },
    { href: '/app/workout', label: t('workoutGenerator') },
  ]

  return (
    <aside className="flex w-56 shrink-0 flex-col border-e border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xl font-bold text-green-500">{t('appName')}</span>
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="text-xs font-medium text-gray-500 hover:text-green-500 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
          title="Switch language"
        >
          {lang === 'en' ? 'AR' : 'EN'}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === href
                ? 'bg-green-500/10 text-green-500 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full text-start text-gray-600">
            {t('signOut')}
          </Button>
        </form>
      </div>
    </aside>
  )
}
