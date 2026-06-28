'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveProgram, getOnboardingData } from '@/actions/onboarding'

interface Exercise {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  target_muscles: string[]
}

interface DaySchedule {
  day_name: string
  focus: string
  exercises: Exercise[]
}

interface Program {
  id: string
  fitness_level: string
  training_system: string
  goal: string
  weekly_schedule: DaySchedule[]
  recommendation_reason: string
  estimated_weeks_to_goal: number
  cardio_recommendation: string
}

const levelColors: Record<string, string> = {
  beginner: '#22C55E',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
}

export default function RecommendationPage() {
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getActiveProgram(), getOnboardingData()]).then(([prog, profile]) => {
      setProgram(prog as Program)
      setFirstName(profile?.first_name || '')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-4">
        <p className="text-white text-center">Could not load your program.</p>
        <button onClick={() => router.push('/onboarding/analyzing')} className="px-6 py-3 rounded-xl font-semibold" style={{ background: '#22C55E', color: 'black' }}>
          Retry
        </button>
      </div>
    )
  }

  const levelColor = levelColors[program.fitness_level] ?? '#22C55E'

  return (
    <div className="flex flex-col min-h-screen pb-8" style={{ background: '#0D0D0D' }}>
      {/* Hero */}
      <div className="px-6 pt-14 pb-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <p className="text-sm font-medium mb-2" style={{ color: '#22C55E' }}>
            Your AI Program is Ready
          </p>
          <h1 className="text-2xl font-bold text-white">
            {firstName ? `${firstName}, here's your plan` : "Here's your plan"}
          </h1>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Fitness Level', value: program.fitness_level, color: levelColor },
          { label: 'Training System', value: program.training_system, color: '#FFFFFF' },
          { label: 'Days / Week', value: `${program.weekly_schedule?.length ?? 0}`, color: '#FFFFFF' },
          { label: 'Timeline', value: `${program.estimated_weeks_to_goal} weeks`, color: '#FFFFFF' },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl flex flex-col gap-1"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <p className="text-xs" style={{ color: '#666' }}>{stat.label}</p>
            <p className="font-bold text-sm capitalize" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Why this program */}
      <div className="px-6 mb-6">
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#22C55E' }}>WHY THIS PROGRAM</p>
          <p className="text-sm leading-relaxed text-white">{program.recommendation_reason}</p>
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#B3B3B3' }}>WEEKLY SCHEDULE</h2>
        <div className="flex flex-col gap-2">
          {program.weekly_schedule?.map((day, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
              >
                {day.day_name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{day.focus}</p>
                <p className="text-xs mt-0.5" style={{ color: '#666' }}>{day.exercises?.length ?? 0} exercises</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cardio */}
      {program.cardio_recommendation && (
        <div className="px-6 mb-6">
          <div
            className="p-4 rounded-2xl"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: '#B3B3B3' }}>CARDIO GUIDANCE</p>
            <p className="text-sm text-white">{program.cardio_recommendation}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-6">
        <button
          onClick={() => router.push('/app/dashboard')}
          className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Start Training →
        </button>
      </div>
    </div>
  )
}
