'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { saveOnboardingAndGenerateProgram } from '@/actions/onboarding'

const messages = [
  'Analyzing your fitness profile…',
  'Calculating optimal training volume…',
  'Determining your fitness level…',
  'Selecting the best training system…',
  'Scheduling your weekly workouts…',
  'Calibrating progressive overload…',
  'Building your personalized program…',
]

export default function AnalyzingPage() {
  const router = useRouter()
  const { data, reset } = useOnboarding()
  const [msgIndex, setMsgIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    saveOnboardingAndGenerateProgram(data)
      .then(result => {
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/onboarding/recommendation')
        }
      })
      .catch(() => setError('Something went wrong. Please try again.'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
        <div className="text-4xl">⚠️</div>
        <p className="text-white text-center font-semibold">Something went wrong</p>
        <p className="text-sm text-center" style={{ color: '#B3B3B3' }}>{error}</p>
        <button
          onClick={() => router.push('/onboarding/health')}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: '#22C55E', color: 'black' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 50%, rgba(34,197,94,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center animate-pulse-green"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M10 24 L19 15 L28 24 L38 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 34 L19 25 L28 34 L38 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
          </div>
          {/* Orbiting dot */}
          <div
            className="absolute -right-1 -top-1 w-4 h-4 rounded-full"
            style={{ background: '#22C55E', animation: 'pulse 1s ease-in-out infinite' }}
          />
        </div>

        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-xl font-bold text-white">AI is building your program</h2>
          <p
            key={msgIndex}
            className="text-sm animate-fade-in"
            style={{ color: '#22C55E' }}
          >
            {messages[msgIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: '#22C55E',
              width: '70%',
              animation: 'shimmer 2s linear infinite',
              backgroundSize: '200% 100%',
              backgroundImage: 'linear-gradient(90deg, #16A34A 0%, #22C55E 50%, #16A34A 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
