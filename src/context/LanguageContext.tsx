'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Lang, translations, TranslationKey } from '@/lib/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key] as string,
  isRTL: false,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('mova_lang') as Lang | null
    if (stored === 'ar' || stored === 'en') setLangState(stored)
  }, [])

  useEffect(() => {
    const isAr = lang === 'ar'
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('mova_lang', lang)
  }, [lang])

  function t(key: TranslationKey): string {
    return translations[lang][key] as string
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
