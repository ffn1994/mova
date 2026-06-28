'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveProgram, getOnboardingData } from '@/actions/onboarding'
import { getRecentWorkouts } from '@/actions/workout-log'
import { useLanguage } from '@/context/LanguageContext'

interface Exercise { name: string; sets: number; reps: string }
interface DaySchedule { day_name: string; focus: string; exercises: Exercise[] }
interface Program {
  training_system: string
  fitness_level: string
  weekly_schedule: DaySchedule[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function DashboardPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const [profile, setProfile] = useState<{ first_name?: string } | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Array<{
    workout_name: string; duration_minutes?: number; total_volume_kg?: number; created_at: string
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOnboardingData(), getActiveProgram(), getRecentWorkouts(3)]).then(
      ([prof, prog, workouts]) => {
        setProfile(prof as { first_name?: string })
        setProgram(prog as Program)
        setRecentWorkouts((workouts ?? []) as typeof recentWorkouts)
        setLoading(false)
      }
    )
  }, [])

  const today = DAY_NAMES[new Date().getDay()]
  const todayWorkout = program?.weekly_schedule?.find(d => d.day_name === today) ?? null

  const workoutsThisWeek = recentWorkouts.filter(w => {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return new Date(w.created_at) >= startOfWeek
  }).length

  function getGreeting() {
    const h = new Date().getHours()
    if (isRTL) {
      if (h < 12) return 'صباح الخير'
      if (h < 17) return 'مساء الخير'
      return 'مساء الخير'
    }
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative px-5 pt-14 pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 60%)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: '#B3B3B3' }}>{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            {profile?.first_name || (isRTL ? 'رياضي' : 'Athlete')} 👋
          </h1>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
        >
          🔔
        </div>
      </div>

      {/* Setup CTA */}
      {!program && (
        <div
          className="p-5 rounded-2xl mb-5"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <p className="font-bold text-white mb-1">
            {isRTL ? 'احصل على برنامجك الذكي' : 'Get Your AI Program'}
          </p>
          <p className="text-sm mb-4" style={{ color: '#B3B3B3' }}>
            {isRTL
              ? 'أجب على 6 أسئلة سريعة ويبني الذكاء الاصطناعي خطتك التدريبية المثالية.'
              : 'Answer 6 quick questions and the AI builds your perfect training plan.'}
          </p>
          <button
            onClick={() => router.push('/onboarding/personal')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-black"
            style={{ background: '#22C55E' }}
          >
            {isRTL ? 'ابنِ برنامجي ←' : 'Build My Program →'}
          </button>
        </div>
      )}

      {/* Stats */}
      {program && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: isRTL ? 'الجلسات' : 'Sessions', value: String(workoutsThisWeek) },
            { label: isRTL ? 'المستوى' : 'Level', value: program.fitness_level ?? '—' },
            { label: isRTL ? 'الأيام' : 'Days', value: String(program.weekly_schedule?.length ?? 0) + (isRTL ? '/أسبوع' : '/wk') },
          ].map(s => (
            <div
              key={s.label}
              className="p-3 rounded-xl text-center"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <p className="text-base font-bold text-white capitalize truncate">{s.value}</p>
              <p className="text-[10px] mt-0.5 capitalize" style={{ color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today's workout */}
      {program && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#666' }}>
            {isRTL ? 'اليوم' : 'Today'}
          </h2>
          {todayWorkout ? (
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(22,163,74,0.06) 100%)',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#22C55E' }}>
                    {isRTL ? 'تمرين اليوم' : "TODAY'S WORKOUT"}
                  </p>
                  <h3 className="text-xl font-bold text-white">{todayWorkout.focus}</h3>
                  <p className="text-sm mt-1" style={{ color: '#B3B3B3' }}>
                    {todayWorkout.exercises?.length ?? 0} {isRTL ? 'تمارين' : 'exercises'}
                  </p>
                </div>
                <span className="text-3xl">💪</span>
              </div>
              <button
                onClick={() => router.push('/app/workout')}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all active:scale-95"
                style={{ background: '#22C55E' }}
              >
                {isRTL ? 'ابدأ التمرين' : 'Start Workout'}
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <span className="text-2xl">😴</span>
              <div>
                <p className="font-bold text-white">{isRTL ? 'يوم راحة' : 'Rest Day'}</p>
                <p className="text-sm" style={{ color: '#B3B3B3' }}>
                  {isRTL ? 'التعافي جزء من التدريب' : 'Recovery is part of training'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly schedule */}
      {program?.weekly_schedule && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
              {isRTL ? 'هذا الأسبوع' : 'This Week'}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {program.weekly_schedule.map((day, i) => {
              const isToday = day.day_name === today
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={isToday
                    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }
                    : { background: '#1A1A1A', border: '1px solid #2A2A2A' }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={isToday
                      ? { background: '#22C55E', color: 'black' }
                      : { background: '#222', color: '#666' }
                    }
                  >
                    {day.day_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{day.focus}</p>
                    <p className="text-xs" style={{ color: '#666' }}>
                      {day.exercises?.length ?? 0} {isRTL ? 'تمارين' : 'exercises'}
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#22C55E', color: 'black' }}>
                      {isRTL ? 'اليوم' : 'Today'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
              {isRTL ? 'الأخيرة' : 'Recent'}
            </h2>
            <button
              onClick={() => router.push('/app/history')}
              className="text-xs font-medium"
              style={{ color: '#22C55E' }}
            >
              {isRTL ? 'عرض الكل' : 'See all'}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recentWorkouts.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#222' }}>
                  ✅
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{w.workout_name}</p>
                  <p className="text-xs" style={{ color: '#666' }}>
                    {w.duration_minutes}{isRTL ? 'د' : 'min'} · {(w.total_volume_kg ?? 0).toFixed(0)}{isRTL ? 'كغ' : 'kg'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
