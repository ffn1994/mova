'use client'

import Link from 'next/link'
import { CoachDecision as CoachDecisionType } from '@/types'
import { Button } from '@/components/ui/Button'

const RECOMMENDATION_CONFIG = {
  train: { label: 'Train Today', color: 'bg-green-500/10 text-green-500 border-green-500/20', dot: 'bg-green-500' },
  deload: { label: 'Deload Week', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  active_recovery: { label: 'Active Recovery', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  rest: { label: 'Rest Day', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
}

const INTENSITY_COLORS = { low: 'text-blue-600', moderate: 'text-amber-600', high: 'text-red-600' }

function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#d97706' : '#dc2626'
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Moderate' : 'Low'

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.2"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3.2"
            strokeDasharray={`${score} 100`} strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Readiness Score</p>
        <div className="w-full bg-gray-100 rounded-full h-1.5 w-36">
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  )
}

export function CoachDecision({ decision, sessionExists }: { decision: CoachDecisionType; sessionExists: boolean }) {
  const config = RECOMMENDATION_CONFIG[decision.recommendation]

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Header: readiness + recommendation */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <ReadinessGauge score={decision.overall_readiness_score} />
          <div className="flex-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${config.color}`}>
              <span className={`w-2 h-2 rounded-full ${config.dot}`} />
              {config.label}
            </span>
            <p className="text-sm text-gray-600 mt-2">{decision.readiness_summary}</p>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Why this recommendation</p>
          <p className="text-sm text-gray-700">{decision.recommendation_reason}</p>
        </div>
      </div>

      {/* Workout session */}
      {decision.session && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{decision.session.type}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs font-medium capitalize ${INTENSITY_COLORS[decision.session.intensity]}`}>
                  {decision.session.intensity} intensity
                </span>
                <span className="text-xs text-gray-400">~{decision.session.estimated_duration_minutes} min</span>
                <span className="text-xs text-gray-400">{decision.session.exercises.length} exercises</span>
              </div>
            </div>
            {!sessionExists && (
              <Link href="/app/coach/log">
                <Button>Start Workout</Button>
              </Link>
            )}
            {sessionExists && (
              <span className="text-sm text-green-500 font-medium">Completed</span>
            )}
          </div>

          {decision.session.pre_workout_note && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 mb-4">
              <p className="text-sm text-green-500">{decision.session.pre_workout_note}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {decision.session.exercises.map((ex, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono w-4">{i + 1}</span>
                      <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                    </div>
                    <div className="ml-6 mt-1 flex flex-wrap gap-1">
                      {ex.target_muscles.map(m => (
                        <span key={m} className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 capitalize">
                          {m.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{ex.sets} × {ex.reps}</p>
                    <p className="text-xs text-gray-400">{ex.rest_seconds}s rest</p>
                  </div>
                </div>
                <div className="ml-6 mt-2 space-y-1">
                  <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{ex.weight_note}</p>
                  <p className="text-xs text-gray-500 italic">{ex.technique_tip}</p>
                </div>
              </div>
            ))}
          </div>

          {decision.session.cardio && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Cardio</p>
              <p className="text-sm text-blue-800">
                {decision.session.cardio.activity} — {decision.session.cardio.duration_minutes} min at {decision.session.cardio.intensity}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recovery advice */}
      {(decision.recommendation === 'rest' || decision.recommendation === 'active_recovery') && decision.recovery_tips && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Recovery Plan</h3>
          <p className="text-sm text-gray-600">{decision.recovery_tips}</p>
        </div>
      )}

      {/* Coaching message */}
      <div className="bg-green-500 rounded-xl p-5 text-black">
        <p className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">From Your Coach</p>
        <p className="text-sm leading-relaxed">{decision.coaching_message}</p>
      </div>

      {/* Weak points */}
      {decision.weak_points && decision.weak_points.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Areas to Prioritize</h3>
          <div className="flex flex-wrap gap-2">
            {decision.weak_points.map((wp, i) => (
              <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                {wp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
