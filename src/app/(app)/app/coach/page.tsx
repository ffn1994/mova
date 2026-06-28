'use client'

import { useState, useEffect } from 'react'
import { ProfileSetup } from '@/components/coach/ProfileSetup'
import { ReadinessForm } from '@/components/coach/ReadinessForm'
import { CoachDecision } from '@/components/coach/CoachDecision'
import { Spinner } from '@/components/ui/Spinner'
import { getUserProfile, getTodayReadiness, getTodayCoachDecision, saveReadiness } from '@/actions/coach'
import { CoachDecision as CoachDecisionType, DailyReadiness, UserFitnessProfile } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

type Stage = 'loading' | 'profile_setup' | 'readiness' | 'analyzing' | 'decision' | 'error'

export default function CoachPage() {
  const { t } = useLanguage()
  const [stage, setStage] = useState<Stage>('loading')
  const [decision, setDecision] = useState<CoachDecisionType | null>(null)
  const [sessionExists, setSessionExists] = useState(false)
  const [profile, setProfile] = useState<UserFitnessProfile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {
    try {
      const [prof, todayReadiness, todayDecision] = await Promise.all([
        getUserProfile(),
        getTodayReadiness(),
        getTodayCoachDecision(),
      ])

      setProfile(prof)

      if (!prof) { setStage('profile_setup'); return }

      if (todayDecision) {
        setDecision(todayDecision.decision as CoachDecisionType)
        setSessionExists(false) // could enhance to check workout_sessions
        setStage('decision')
        return
      }

      if (todayReadiness) {
        // Have readiness but no decision — run analysis
        await runAnalysis(todayReadiness, todayReadiness.id!)
        return
      }

      setStage('readiness')
    } catch {
      setErrorMessage('Something went wrong. Please refresh.')
      setStage('error')
    }
  }

  async function handleReadinessSubmit(readiness: DailyReadiness) {
    setStage('analyzing')
    try {
      const result = await saveReadiness(readiness)
      if (result.error || !result.id) throw new Error(result.error ?? 'Failed to save readiness')
      await runAnalysis(readiness, result.id)
    } catch (err) {
      setErrorMessage(String(err))
      setStage('error')
    }
  }

  async function runAnalysis(readiness: DailyReadiness, readinessId: string) {
    setStage('analyzing')
    try {
      const response = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readiness, readinessId }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setDecision(data.decision)
      setStage('decision')
    } catch (err) {
      setErrorMessage(String(err))
      setStage('error')
    }
  }

  if (stage === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="p-8">
      {stage === 'profile_setup' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-1">{t('aiCoachPageTitle')}</h1>
          <p className="mb-8" style={{ color: '#B3B3B3' }}>{t('aiCoachPageDesc')}</p>
          <ProfileSetup onComplete={() => { setStage('readiness') }} />
        </>
      )}

      {stage === 'readiness' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-1">{t('morningCheckin')}</h1>
          <p className="mb-8" style={{ color: '#B3B3B3' }}>
            {profile ? t('morningCheckinGreeting') : t('morningCheckinDesc')}
          </p>
          <ReadinessForm onSubmit={handleReadinessSubmit} loading={false} />
        </>
      )}

      {stage === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner className="w-8 h-8" />
          <div className="text-center">
            <p className="font-semibold text-gray-900">{t('analyzingData')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('analyzingDesc')}</p>
          </div>
        </div>
      )}

      {stage === 'decision' && decision && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{t('todaysPlan')}</h1>
              <p className="text-sm mt-0.5" style={{ color: '#B3B3B3' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setStage('readiness')}
              className="text-sm transition-colors"
              style={{ color: '#666' }}
            >
              {t('reCheckIn')}
            </button>
          </div>
          <CoachDecision decision={decision} sessionExists={sessionExists} />
        </>
      )}

      {stage === 'error' && (
        <div className="rounded-xl p-6 max-w-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 className="font-semibold text-red-400 mb-1">{t('error')}</h3>
          <p className="text-sm text-red-400">{errorMessage}</p>
          <button onClick={() => setStage('loading')} className="mt-3 text-sm text-red-400 hover:underline">
            {t('tryAgain')}
          </button>
        </div>
      )}
    </div>
  )
}
