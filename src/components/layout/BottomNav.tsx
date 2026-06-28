'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export function BottomNav() {
  const pathname = usePathname()
  const { t, lang, setLang, isRTL } = useLanguage()

  const navItems = [
    {
      href: '/app/dashboard',
      label: t('dashboard'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 9L11 3L19 9V19H14V14H8V19H3V9Z"
            stroke={active ? '#22C55E' : '#666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            fill={active ? 'rgba(34,197,94,0.1)' : 'none'}
          />
        </svg>
      ),
    },
    {
      href: '/app/workout',
      label: t('workoutGenerator'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M6 11H4M18 11H16M6 11C6 8.24 8.24 6 11 6C13.76 6 16 8.24 16 11C16 13.76 13.76 16 11 16C8.24 16 6 13.76 6 11Z"
            stroke={active ? '#22C55E' : '#666'} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="4" cy="11" r="1.5" fill={active ? '#22C55E' : '#666'}/>
          <circle cx="18" cy="11" r="1.5" fill={active ? '#22C55E' : '#666'}/>
        </svg>
      ),
    },
    {
      href: '/app/history',
      label: isRTL ? 'السجل' : 'History',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 7V11L14 13M19 11C19 15.42 15.42 19 11 19C6.58 19 3 15.42 3 11C3 6.58 6.58 3 11 3C15.42 3 19 6.58 19 11Z"
            stroke={active ? '#22C55E' : '#666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: '/app/profile',
      label: isRTL ? 'الملف' : 'Profile',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="3.5" stroke={active ? '#22C55E' : '#666'} strokeWidth="1.5"
            fill={active ? 'rgba(34,197,94,0.1)' : 'none'}/>
          <path d="M4 19C4 15.69 7.13 13 11 13C14.87 13 18 15.69 18 19"
            stroke={active ? '#22C55E' : '#666'} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: 'rgba(13,13,13,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #1E1E1E',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all active:scale-90"
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium" style={{ color: active ? '#22C55E' : '#666' }}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all active:scale-90"
        >
          <div className="w-[22px] h-[22px] flex items-center justify-center">
            <span className="text-base">🌐</span>
          </div>
          <span className="text-[10px] font-medium" style={{ color: '#666' }}>
            {lang === 'en' ? 'عربي' : 'EN'}
          </span>
        </button>
      </div>
    </div>
  )
}
