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
  notes?: string
}

interface DaySchedule {
  day_name: string
  focus: string
  exercises: Exercise[]
}

interface Program {
  id: string
  training_system: string
  weekly_schedule: DaySchedule[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WorkoutPage() {
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getActiveProgram(), getOnboardingData()]).then(([prog]) => {
      setProgram(prog as Program)
      if (prog?.weekly_schedule) {
        const todayIndex = prog.weekly_schedule.findIndex(
          (d: DaySchedule) => d.day_name === DAY_NAMES[new Date().getDay()]
        )
        setSelectedDay(todayIndex >= 0 ? todayIndex : 0)
      }
      setLoading(false)
    })
  }, [])

  function handleStartWorkout(day: DaySchedule, programId: string) {
    sessionStorage.setItem('active_workout', JSON.stringify({ day, programId }))
    router.push('/app/workout/session')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6 text-center">
        <div className="text-5xl">🏋️</div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">No Program Yet</h2>
          <p className="text-sm" style={{ color: '#B3B3B3' }}>
            Complete your setup to get an AI-generated training program.
          </p>
        </div>
        <button
          onClick={() => router.push('/onboarding/personal')}
          className="px-8 py-3.5 rounded-2xl font-bold text-black"
          style={{ background: '#22C55E' }}
        >
          Build My Program
        </button>
      </div>
    )
  }

  const schedule = program.weekly_schedule ?? []
  const activeDay = selectedDay !== null ? schedule[selectedDay] : null

  return (
    <div className="px-5 pt-14 pb-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)' }}
      />

      <h1 className="text-2xl font-bold text-white mb-1">Workouts</h1>
      <p className="text-sm mb-5" style={{ color: '#B3B3B3' }}>
        {program.training_system} Program
      </p>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1 scrollbar-hide">
        {schedule.map((day, i) => {
          const isToday = day.day_name === DAY_NAMES[new Date().getDay()]
          const isSelected = selectedDay === i
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all"
              style={isSelected
                ? { background: '#22C55E', color: 'black' }
                : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
              }
            >
              <span className="text-[10px] font-medium">{day.day_name.slice(0, 3).toUpperCase()}</span>
              {isToday && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: isSelected ? 'black' : '#22C55E' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Active day detail */}
      {activeDay && (
        <>
          <div
            className="p-5 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(22,163,74,0.04) 100%)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#22C55E' }}>
              {activeDay.day_name === DAY_NAMES[new Date().getDay()] ? "TODAY'S WORKOUT" : activeDay.day_name.toUpperCase()}
            </p>
            <h2 className="text-xl font-bold text-white mb-1">{activeDay.focus}</h2>
            <p className="text-sm mb-4" style={{ color: '#B3B3B3' }}>
              {activeDay.exercises.length} exercises
            </p>
            <button
              onClick={() => handleStartWorkout(activeDay, program.id)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all active:scale-95"
              style={{ background: '#22C55E' }}
            >
              Start Workout →
            </button>
          </div>

          {/* Exercise list */}
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#666' }}>Exercises</h3>
          <div className="flex flex-col gap-2">
            {activeDay.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: '#222', color: '#22C55E' }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{ex.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#B3B3B3' }}>
                    {ex.sets} sets × {ex.reps} · {ex.rest_seconds}s rest
                  </p>
                  {ex.target_muscles?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {ex.target_muscles.slice(0, 3).map(m => (
                        <span
                          key={m}
                          className="text-[10px] px-1.5 py-0.5 rounded-md capitalize"
                          style={{ background: '#222', color: '#666' }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
