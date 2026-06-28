'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Summary {
  workout_name: string
  duration_minutes: number
  total_volume_kg: number
  muscles_trained: string[]
  exercises: number
  estimated_calories: number
}

export default function SummaryPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('workout_summary')
      if (!stored) { router.push('/app/dashboard'); return }
      setSummary(JSON.parse(stored))
    } catch {
      router.push('/app/dashboard')
    }
  }, [router])

  if (!summary) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0D0D0D' }}>
      {/* Success banner */}
      <div
        className="px-5 pt-14 pb-8 text-center relative"
        style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.1) 0%, transparent 100%)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
          style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          🎉
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Workout Complete!</h1>
        <p className="text-sm" style={{ color: '#B3B3B3' }}>{summary.workout_name}</p>
      </div>

      <div className="flex-1 px-5 pb-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '⏱️', label: 'Duration', value: `${summary.duration_minutes} min` },
            { icon: '🏋️', label: 'Volume', value: `${summary.total_volume_kg.toFixed(0)} kg` },
            { icon: '💪', label: 'Exercises', value: String(summary.exercises) },
            { icon: '🔥', label: 'Calories', value: `~${summary.estimated_calories}` },
          ].map(s => (
            <div
              key={s.label}
              className="p-4 rounded-2xl"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs" style={{ color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Muscles trained */}
        {summary.muscles_trained?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#666' }}>Muscles Trained</h2>
            <div className="flex flex-wrap gap-2">
              {summary.muscles_trained.map(m => (
                <span
                  key={m}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="mb-6 p-5 rounded-2xl" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <p className="text-sm font-semibold mb-4 text-white">How did this workout feel?</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-2xl transition-all active:scale-90"
                style={{ opacity: rating >= star ? 1 : 0.3 }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* AI feedback placeholder */}
        <div
          className="mb-6 p-4 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#22C55E' }}>AI COACH FEEDBACK</p>
          <p className="text-sm text-white leading-relaxed">
            Great work completing {summary.workout_name}! You trained {summary.muscles_trained?.length ?? 0} muscle groups across {summary.exercises} exercises.
            Keep this momentum going for your next session. Rest well tonight to maximize recovery.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => { sessionStorage.removeItem('workout_summary'); router.push('/app/dashboard') }}
          className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
