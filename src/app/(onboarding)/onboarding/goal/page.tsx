'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'

const goals = [
  { id: 'lose_fat', icon: '🔥', title: 'Lose Fat', desc: 'Burn body fat while preserving muscle' },
  { id: 'build_muscle', icon: '💪', title: 'Build Muscle', desc: 'Gain lean muscle mass and size' },
  { id: 'body_recomp', icon: '⚖️', title: 'Body Recomposition', desc: 'Lose fat and gain muscle simultaneously' },
  { id: 'increase_strength', icon: '🏋️', title: 'Increase Strength', desc: 'Get stronger with progressive overload' },
  { id: 'improve_fitness', icon: '🏃', title: 'Improve Fitness', desc: 'Boost endurance and cardio capacity' },
  { id: 'general_health', icon: '❤️', title: 'General Health', desc: 'Stay active and feel better overall' },
]

export default function GoalPage() {
  const router = useRouter()
  const { data, update } = useOnboarding()

  return (
    <OnboardingShell
      step={2}
      totalSteps={6}
      title="What's your main goal?"
      subtitle="We'll build your entire program around this"
      onBack={() => router.push('/onboarding/personal')}
    >
      <div className="flex flex-col gap-3">
        {goals.map(g => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              update({ fitness_goal: g.id })
              router.push('/onboarding/experience')
            }}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
            style={data.fitness_goal === g.id
              ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E' }
              : { background: '#1A1A1A', border: '1px solid #2A2A2A' }
            }
          >
            <span className="text-2xl">{g.icon}</span>
            <div>
              <p className="font-semibold text-white text-sm">{g.title}</p>
              <p className="text-xs mt-0.5" style={{ color: '#B3B3B3' }}>{g.desc}</p>
            </div>
            {data.fitness_goal === g.id && (
              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#22C55E' }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </OnboardingShell>
  )
}
