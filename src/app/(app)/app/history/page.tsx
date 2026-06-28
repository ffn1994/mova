'use client'

import { useEffect, useState } from 'react'
import { getAllWorkouts } from '@/actions/workout-log'

interface Workout {
  id: string
  workout_name: string
  duration_minutes: number
  total_volume_kg: number
  muscles_trained: string[]
  estimated_calories: number
  performance_rating?: number
  created_at: string
  exercises: unknown[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getWeekKey(iso: string) {
  const d = new Date(iso)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return monday.toISOString().slice(0, 10)
}

function WeeklyChart({ workouts }: { workouts: Workout[] }) {
  const now = new Date()
  const weeks: { label: string; key: string }[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i * 7)
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((day + 6) % 7))
    const key = monday.toISOString().slice(0, 10)
    const label = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    weeks.push({ label, key })
  }

  const countByWeek: Record<string, number> = {}
  workouts.forEach(w => {
    const key = getWeekKey(w.created_at)
    countByWeek[key] = (countByWeek[key] ?? 0) + 1
  })

  const max = Math.max(1, ...weeks.map(w => countByWeek[w.key] ?? 0))

  return (
    <div className="p-4 rounded-2xl mb-5" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
      <p className="text-xs font-semibold mb-4" style={{ color: '#B3B3B3' }}>WORKOUTS PER WEEK</p>
      <div className="flex items-end gap-1.5" style={{ height: '72px' }}>
        {weeks.map(w => {
          const count = countByWeek[w.key] ?? 0
          const isThisWeek = w.key === getWeekKey(now.toISOString())
          const heightPct = max > 0 ? (count / max) * 100 : 0
          return (
            <div key={w.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end rounded-md overflow-hidden" style={{ height: '56px', background: '#111' }}>
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: count === 0 ? '4px' : `${Math.max(10, heightPct)}%`,
                    background: isThisWeek ? '#22C55E' : count > 0 ? 'rgba(34,197,94,0.4)' : '#222',
                  }}
                />
              </div>
              <span className="text-[9px]" style={{ color: isThisWeek ? '#22C55E' : '#444' }}>
                {w.label.split(' ')[1]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getAllWorkouts().then(data => {
      setWorkouts(data as Workout[])
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

  const totalVolume = workouts.reduce((acc, w) => acc + (w.total_volume_kg ?? 0), 0)
  const totalDuration = workouts.reduce((acc, w) => acc + (w.duration_minutes ?? 0), 0)

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-2xl font-bold text-white mb-1">History</h1>
      <p className="text-sm mb-5" style={{ color: '#B3B3B3' }}>{workouts.length} workouts logged</p>

      {/* Summary stats */}
      {workouts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Workouts', value: String(workouts.length) },
            { label: 'Total Volume', value: `${(totalVolume / 1000).toFixed(1)}t` },
            { label: 'Total Time', value: `${Math.round(totalDuration / 60)}h` },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly chart */}
      <WeeklyChart workouts={workouts} />

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <span className="text-5xl">📝</span>
          <div>
            <p className="text-white font-semibold mb-1">No Workouts Yet</p>
            <p className="text-sm" style={{ color: '#B3B3B3' }}>Complete your first workout to see history here.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map(w => (
            <div key={w.id}>
              <button
                onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                className="w-full p-4 rounded-2xl text-left transition-all active:scale-98"
                style={{ background: '#1A1A1A', border: `1px solid ${expanded === w.id ? 'rgba(34,197,94,0.3)' : '#2A2A2A'}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-white text-sm">{w.workout_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>{formatDate(w.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {w.performance_rating && (
                      <span className="text-xs" style={{ color: '#F59E0B' }}>{'⭐'.repeat(w.performance_rating)}</span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform"
                      style={{ transform: expanded === w.id ? 'rotate(180deg)' : 'none' }}>
                      <path d="M4 6L8 10L12 6" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs" style={{ color: '#B3B3B3' }}>{w.duration_minutes}min</span>
                  <span className="text-xs" style={{ color: '#B3B3B3' }}>{(w.total_volume_kg ?? 0).toFixed(0)}kg</span>
                  <span className="text-xs" style={{ color: '#B3B3B3' }}>~{w.estimated_calories} cal</span>
                </div>
              </button>

              {expanded === w.id && (
                <div className="p-4 rounded-b-2xl -mt-2" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderTop: 'none' }}>
                  {w.muscles_trained?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {w.muscles_trained.map(m => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  {Array.isArray(w.exercises) && w.exercises.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {(w.exercises as Array<{ name: string; sets: unknown[] }>).map((ex, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-xs text-white">{ex.name}</p>
                          <p className="text-xs" style={{ color: '#666' }}>
                            {ex.sets?.filter((s: unknown) => (s as { completed: boolean }).completed).length}/{ex.sets?.length} sets
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
