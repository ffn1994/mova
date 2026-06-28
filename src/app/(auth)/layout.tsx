'use client'

import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container flex flex-col min-h-screen" style={{ background: '#0D0D0D' }}>
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(34,197,94,0.1) 0%, transparent 65%)',
        }}
      />
      <div className="relative flex-1 flex flex-col">
        {/* Back link */}
        <div className="px-6 pt-14">
          <Link href="/welcome" className="inline-flex items-center gap-2 text-sm" style={{ color: '#B3B3B3' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
        </div>

        {/* Logo */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-black tracking-tight text-white">MOVA</h1>
          <div className="w-8 h-0.5 mt-1 rounded-full" style={{ background: '#22C55E' }} />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}
