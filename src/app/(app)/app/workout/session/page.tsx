'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { saveLoggedWorkout } from '@/actions/workout-log'

interface Exercise {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  target_muscles: string[]
}

interface LoggedSet {
  weight: string
  reps: string
  rpe: number
  completed: boolean
  notes: string
}

interface ExerciseLog {
  exercise: Exercise
  sets: LoggedSet[]
}

function defaultSet(): LoggedSet {
  return { weight: '', reps: '', rpe: 7, completed: false, notes: '' }
}

const TIPS: Record<string, string> = {
  'bench press': 'Retract scapula, feet flat on floor. Lower bar to mid-chest with controlled tempo.',
  'squat': 'Chest up, knees track toes. Drive through the whole foot on the way up.',
  'deadlift': 'Bar over mid-foot, hinge at hips first. Keep bar close to body throughout the pull.',
  'pull-up': 'Full dead hang at bottom. Drive elbows toward hips, chin over bar.',
  'row': 'Neutral spine, pull to lower chest. Squeeze shoulder blades together at the top.',
  'overhead press': 'Brace core hard, press straight up. Lock out fully at the top.',
  'curl': 'Elbows pinned at sides. Full extension at bottom, squeeze hard at top.',
  'tricep': 'Keep elbows tucked. Full lockout at the bottom, slow eccentric.',
  'lunge': 'Step wide enough so front knee stays above ankle. Drive through front heel.',
  'rdl': 'Soft knee bend, push hips back. Feel hamstring stretch before reversing.',
  'plank': 'Straight line head to heels. Squeeze glutes and abs, breathe normally.',
}

function getTip(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, tip] of Object.entries(TIPS)) {
    if (lower.includes(key)) return tip
  }
  return 'Focus on controlled movement. Full range of motion beats heavy weight with poor form.'
}

export default function SessionPage() {
  const router = useRouter()
  const [workoutData, setWorkoutData] = useState<{ day: { focus: string; exercises: Exercise[] }; programId: string } | null>(null)
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Elapsed timer
  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [startTime])

  // Load workout from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('active_workout')
      if (!stored) { router.push('/app/workout'); return }
      const data = JSON.parse(stored)
      setWorkoutData(data)
      setLogs(data.day.exercises.map((ex: Exercise) => ({
        exercise: ex,
        sets: Array.from({ length: ex.sets }, () => defaultSet()),
      })))
    } catch {
      router.push('/app/workout')
    }
  }, [router])

  // Rest timer
  useEffect(() => {
    if (restTimer === null) return
    if (restTimer <= 0) { setRestTimer(null); return }
    restRef.current = setTimeout(() => setRestTimer(t => (t !== null ? t - 1 : null)), 1000)
    return () => { if (restRef.current) clearTimeout(restRef.current) }
  }, [restTimer])

  const updateSet = useCallback((exIdx: number, setIdx: number, patch: Partial<LoggedSet>) => {
    setLogs(prev => {
      const next = [...prev]
      next[exIdx] = {
        ...next[exIdx],
        sets: next[exIdx].sets.map((s, i) => i === setIdx ? { ...s, ...patch } : s),
      }
      return next
    })
  }, [])

  function markSetComplete(exIdx: number, setIdx: number, restSeconds: number) {
    updateSet(exIdx, setIdx, { completed: true })
    setRestTimer(restSeconds)
  }

  async function finishWorkout() {
    setSaving(true)
    const exercises = logs.map(log => ({
      name: log.exercise.name,
      target_muscles: log.exercise.target_muscles,
      sets: log.sets,
    }))

    const totalVolume = logs.reduce((acc, log) => {
      return acc + log.sets.reduce((s, set) => {
        const w = parseFloat(set.weight) || 0
        const r = parseInt(set.reps) || 0
        return s + (set.completed ? w * r : 0)
      }, 0)
    }, 0)

    const muscles = [...new Set(logs.flatMap(l => l.exercise.target_muscles))]
    const duration = Math.round(elapsed / 60000)

    const result = await saveLoggedWorkout({
      workout_name: workoutData?.day.focus ?? 'Workout',
      program_id: workoutData?.programId ?? null,
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date().toISOString(),
      duration_minutes: duration,
      total_volume_kg: totalVolume,
      estimated_calories: Math.round(duration * 8),
      muscles_trained: muscles,
      exercises,
    })

    sessionStorage.setItem('workout_summary', JSON.stringify({
      workout_name: workoutData?.day.focus,
      duration_minutes: duration,
      total_volume_kg: totalVolume,
      muscles_trained: muscles,
      exercises: logs.length,
      estimated_calories: Math.round(duration * 8),
    }))

    sessionStorage.removeItem('active_workout')
    router.push('/app/workout/summary')
  }

  if (!workoutData || logs.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  const currentLog = logs[currentExIdx]
  const currentEx = currentLog.exercise
  const completedExercises = logs.filter(l => l.sets.every(s => s.completed)).length
  const progress = (completedExercises / logs.length) * 100

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0D0D0D' }}>
      {/* Rest timer overlay */}
      {restTimer !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: '#B3B3B3' }}>REST</p>
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black text-white mb-6"
            style={{ border: '3px solid #22C55E', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
          >
            {restTimer}
          </div>
          <button
            onClick={() => setRestTimer(null)}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-black"
            style={{ background: '#22C55E' }}
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className="px-5 pt-12 pb-4 flex items-center gap-4"
        style={{ background: '#0D0D0D', borderBottom: '1px solid #1A1A1A' }}
      >
        <button
          onClick={() => { if (confirm('End workout?')) { sessionStorage.removeItem('active_workout'); router.push('/app/workout') } }}
          className="p-2 -ml-2 rounded-xl"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 16L7 10L13 4" stroke="#B3B3B3" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: '#B3B3B3' }}>{workoutData.day.focus}</p>
          <p className="font-bold text-white">{formatTime(elapsed)}</p>
        </div>
        <button
          onClick={finishWorkout}
          disabled={saving}
          className="px-4 py-2 rounded-xl font-bold text-sm text-black"
          style={{ background: '#22C55E' }}
        >
          {saving ? '…' : 'Finish'}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: '#22C55E' }}
        />
      </div>

      {/* Exercise tabs */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {logs.map((log, i) => {
          const allDone = log.sets.every(s => s.completed)
          return (
            <button
              key={i}
              onClick={() => setCurrentExIdx(i)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={i === currentExIdx
                ? { background: '#22C55E', color: 'black' }
                : allDone
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: '#1A1A1A', color: '#666', border: '1px solid #2A2A2A' }
              }
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Current exercise */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">{currentEx.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: '#B3B3B3' }}>
            {currentEx.sets} sets × {currentEx.reps} · {currentEx.rest_seconds}s rest
          </p>
          {currentEx.target_muscles?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {currentEx.target_muscles.map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-md capitalize" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                  {m}
                </span>
              ))}
            </div>
          )}
          {/* Exercise tips card */}
          <div className="mt-3 p-3 rounded-xl flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2A2A' }}>
            <span className="text-xl mt-0.5">💡</span>
            <div>
              <p className="text-xs font-semibold text-white mb-0.5">Form tip</p>
              <p className="text-xs leading-relaxed" style={{ color: '#B3B3B3' }}>
                {getTip(currentEx.name)}
              </p>
            </div>
          </div>
        </div>

        {/* Sets */}
        <div className="flex flex-col gap-3">
          {currentLog.sets.map((set, si) => (
            <div
              key={si}
              className="p-4 rounded-2xl transition-all"
              style={set.completed
                ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }
                : { background: '#1A1A1A', border: '1px solid #2A2A2A' }
              }
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: set.completed ? '#22C55E' : '#222', color: set.completed ? 'black' : '#666' }}
                >
                  {si + 1}
                </span>
                <span className="text-sm font-medium" style={{ color: set.completed ? '#22C55E' : '#B3B3B3' }}>
                  Set {si + 1} {set.completed ? '✓' : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#666' }}>Weight (kg)</label>
                  <input
                    type="number" placeholder="0"
                    value={set.weight}
                    onChange={e => updateSet(currentExIdx, si, { weight: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white text-center outline-none"
                    style={{ background: '#222', border: '1px solid #2A2A2A' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#666' }}>Reps</label>
                  <input
                    type="number" placeholder="0"
                    value={set.reps}
                    onChange={e => updateSet(currentExIdx, si, { reps: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white text-center outline-none"
                    style={{ background: '#222', border: '1px solid #2A2A2A' }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs mb-1.5" style={{ color: '#666' }}>RPE: {set.rpe}/10</label>
                <input
                  type="range" min={1} max={10}
                  value={set.rpe}
                  onChange={e => updateSet(currentExIdx, si, { rpe: Number(e.target.value) })}
                  className="w-full accent-green-500"
                />
              </div>

              {!set.completed && (
                <button
                  onClick={() => markSetComplete(currentExIdx, si, currentEx.rest_seconds)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-black transition-all active:scale-95"
                  style={{ background: '#22C55E' }}
                >
                  Complete Set
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next exercise button */}
        {currentExIdx < logs.length - 1 && (
          <button
            onClick={() => setCurrentExIdx(i => i + 1)}
            className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }}
          >
            Next Exercise →
          </button>
        )}
      </div>
    </div>
  )
}
