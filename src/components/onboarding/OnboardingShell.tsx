'use client'

import { ReactNode } from 'react'

interface Props {
  step: number
  totalSteps: number
  title: string
  subtitle: string
  onBack?: () => void
  children: ReactNode
}

export function OnboardingShell({ step, totalSteps, title, subtitle, onBack, children }: Props) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0D0D0D' }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        {/* Back + step counter */}
        <div className="flex items-center justify-between mb-6">
          {onBack ? (
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl transition-colors active:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 16L7 10L13 4" stroke="#B3B3B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : <div />}
          <span className="text-xs font-medium" style={{ color: '#666' }}>
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-6" style={{ background: '#1A1A1A' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)' }}
          />
        </div>

        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm mt-1" style={{ color: '#B3B3B3' }}>{subtitle}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {children}
      </div>
    </div>
  )
}
