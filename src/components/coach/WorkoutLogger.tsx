'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CoachSession, WorkoutSession, ExerciseSet, ExerciseFeedback } from '@/types'
import { saveWorkoutSession } from '@/actions/coach'
import { Button } from '@/components/ui/Button'

interface LoggedSet {
  weight: string
  reps: string
  rpe: string
}

interface LoggedExercise {
  exerciseId: string
  name: string
  targetMuscles: string[]
  targetSets: number
  sets: LoggedSet[]
  showFeedback: boolean
  feedback: {
    technique: number
    difficulty: number
    weightFeel: 'too_light' | 'appropriate' | 'too_heavy'
  }
}

interface Props {
  session: CoachSession
}

export function WorkoutLogger({ session }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sessionRPE, setSessionRPE] = useState(7)
  const [sessionNotes, setSessionNotes] = useState('')
  const [startTime] = useState(Date.now())

  const [exercises, setExercises] = useState<LoggedExercise[]>(() =>
    session.exercises.map(ex => ({
      exerciseId: ex.name.toLowerCase().replace(/\s+/g, '_'),
      name: ex.name,
      targetMuscles: ex.target_muscles,
      targetSets: ex.sets,
      sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', rpe: '' })),
      showFeedback: false,
      feedback: { technique: 4, difficulty: 3, weightFeel: 'appropriate' },
    }))
  )

  function updateSet(exIdx: number, setIdx: number, field: keyof LoggedSet, value: string) {
    setExercises(prev => {
      const updated = [...prev]
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s),
      }
      return updated
    })
  }

  function addSet(exIdx: number) {
    setExercises(prev => {
      const updated = [...prev]
      const last = updated[exIdx].sets[updated[exIdx].sets.length - 1]
      updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets, { ...last }] }
      return updated
    })
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises(prev => {
      const updated = [...prev]
      if (updated[exIdx].sets.length <= 1) return prev
      updated[exIdx] = { ...updated[exIdx], sets: updated[exIdx].sets.filter((_, i) => i !== setIdx) }
      return updated
    })
  }

  function toggleFeedback(exIdx: number) {
    setExercises(prev => {
      const updated = [...prev]
      updated[exIdx] = { ...updated[exIdx], showFeedback: !updated[exIdx].showFeedback }
      return updated
    })
  }

  function updateFeedback(exIdx: number, field: keyof LoggedExercise['feedback'], value: LoggedExercise['feedback'][typeof field]) {
    setExercises(prev => {
      const updated = [...prev]
      updated[exIdx] = { ...updated[exIdx], feedback: { ...updated[exIdx].feedback, [field]: value } }
      return updated
    })
  }

  function handleSubmit() {
    setError(null)
    const durationMinutes = Math.round((Date.now() - startTime) / 60000)

    const workoutSession: WorkoutSession = {
      session_type: session.type,
      duration_minutes: durationMinutes,
      overall_rpe: sessionRPE,
      notes: sessionNotes || undefined,
      exercises: exercises.map((ex, idx) => ({
        exercise_id: ex.exerciseId,
        exercise_name: ex.name,
        sort_order: idx,
        target_muscles: ex.targetMuscles,
        sets: ex.sets
          .filter(s => s.reps !== '')
          .map((s, setIdx): ExerciseSet => ({
            set_number: setIdx + 1,
            weight_kg: s.weight !== '' ? Number(s.weight) : null,
            reps: s.reps !== '' ? Number(s.reps) : null,
            rpe: s.rpe !== '' ? Number(s.rpe) : null,
          })),
        feedback: {
          technique_confidence: ex.feedback.technique,
          difficulty: ex.feedback.difficulty,
          weight_feel: ex.feedback.weightFeel,
        } as ExerciseFeedback,
      })),
    }

    startTransition(async () => {
      const result = await saveWorkoutSession(workoutSession)
      if (result.error) setError(result.error)
      else router.push('/app/coach')
    })
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Session header */}
      <div className="bg-green-500 text-black rounded-xl px-5 py-4">
        <h2 className="font-semibold">{session.type}</h2>
        <p className="text-sm text-black/60 mt-0.5">~{session.estimated_duration_minutes} min · {session.intensity} intensity</p>
      </div>

      {/* Exercises */}
      {exercises.map((ex, exIdx) => {
        const planned = session.exercises[exIdx]
        return (
          <div key={exIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{ex.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Target: {planned.sets} × {planned.reps} — {planned.weight_note}</p>
                </div>
                <button onClick={() => toggleFeedback(exIdx)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  {ex.showFeedback ? 'Hide feedback' : 'Rate exercise'}
                </button>
              </div>
              {planned.technique_tip && (
                <p className="text-xs text-amber-600 mt-2 italic">{planned.technique_tip}</p>
              )}
            </div>

            {/* Sets */}
            <div className="px-5 py-3">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 font-medium mb-2 px-1">
                <span>Set</span><span>Weight (kg)</span><span>Reps</span><span>RPE</span>
              </div>
              {ex.sets.map((s, setIdx) => (
                <div key={setIdx} className="grid grid-cols-4 gap-2 mb-2 items-center">
                  <span className="text-sm text-gray-500 pl-1">{setIdx + 1}</span>
                  <input value={s.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                    type="number" min={0} step={0.5} placeholder="—"
                    className="rounded border border-gray-200 px-2 py-1.5 text-sm text-center focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"/>
                  <input value={s.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    type="number" min={1} placeholder="—"
                    className="rounded border border-gray-200 px-2 py-1.5 text-sm text-center focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"/>
                  <div className="flex items-center gap-1">
                    <input value={s.rpe} onChange={e => updateSet(exIdx, setIdx, 'rpe', e.target.value)}
                      type="number" min={1} max={10} step={0.5} placeholder="—"
                      className="rounded border border-gray-200 px-2 py-1.5 text-sm text-center focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-full"/>
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(exIdx, setIdx)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0">×</button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => addSet(exIdx)}
                className="text-xs text-green-500 hover:text-green-400 font-medium mt-1">
                + Add set
              </button>
            </div>

            {/* Feedback panel */}
            {ex.showFeedback && (
              <div className="px-5 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Exercise Feedback</p>

                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Technique confidence</p>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => updateFeedback(exIdx, 'technique', n)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold border transition-colors ${ex.feedback.technique === n ? 'bg-green-500 text-black border-green-500' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Difficulty</p>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => updateFeedback(exIdx, 'difficulty', n)}
                          className={`w-8 h-8 rounded-full text-xs font-semibold border transition-colors ${ex.feedback.difficulty === n ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Weight felt</p>
                    <div className="flex gap-2">
                      {([
                        { value: 'too_light', label: 'Too light' },
                        { value: 'appropriate', label: 'Just right' },
                        { value: 'too_heavy', label: 'Too heavy' },
                      ] as const).map(({ value, label }) => (
                        <button key={value} onClick={() => updateFeedback(exIdx, 'weightFeel', value)}
                          className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${ex.feedback.weightFeel === value ? 'border-green-500 bg-green-500/10 text-green-500 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Session wrap-up */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Wrap Up Session</h3>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Overall session RPE</label>
            <span className="text-sm font-bold text-green-500">{sessionRPE}/10</span>
          </div>
          <input type="range" min={1} max={10} step={0.5} value={sessionRPE}
            onChange={e => setSessionRPE(Number(e.target.value))}
            className="w-full accent-green-500"/>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Very easy</span><span>Max effort</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session notes (optional)</label>
          <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)}
            rows={2} placeholder="How did it go? Any PRs, issues, or observations..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"/>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Button onClick={handleSubmit} loading={pending} className="w-full">
        Complete Workout
      </Button>
    </div>
  )
}
