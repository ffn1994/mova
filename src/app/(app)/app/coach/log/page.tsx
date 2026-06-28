'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WorkoutLogger } from '@/components/coach/WorkoutLogger'
import { Spinner } from '@/components/ui/Spinner'
import { getTodayCoachDecision } from '@/actions/coach'
import { CoachDecision } from '@/types'

export default function WorkoutLogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<CoachDecision['session'] | null>(null)

  useEffect(() => {
    getTodayCoachDecision().then(data => {
      if (!data?.decision?.session) {
        router.replace('/app/coach')
        return
      }
      setSession(data.decision.session)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="p-6 pt-14">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Log Workout</h1>
        <p className="text-sm mt-0.5" style={{ color: '#B3B3B3' }}>Track your sets and give feedback as you go.</p>
      </div>
      <WorkoutLogger session={session} />
    </div>
  )
}
