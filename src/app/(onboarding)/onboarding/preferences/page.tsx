'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'

const locations = [
  { id: 'gym', icon: '🏋️', label: 'Commercial Gym', desc: 'Full equipment available' },
  { id: 'home_gym', icon: '🏠', label: 'Home Gym', desc: 'Barbells, dumbbells, rack' },
  { id: 'home', icon: '🛋️', label: 'Home / Bodyweight', desc: 'Minimal or no equipment' },
]

const times = [
  { id: 'morning', label: '🌅 Morning' },
  { id: 'afternoon', label: '☀️ Afternoon' },
  { id: 'evening', label: '🌙 Evening' },
  { id: 'flexible', label: '🔄 Flexible' },
]

export default function PreferencesPage() {
  const router = useRouter()
  const { data, update } = useOnboarding()

  return (
    <OnboardingShell
      step={4}
      totalSteps={6}
      title="Training Preferences"
      subtitle="We'll build your schedule around your life"
      onBack={() => router.push('/onboarding/experience')}
    >
      <div className="flex flex-col gap-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">Where will you train?</label>
          <div className="flex flex-col gap-2">
            {locations.map(loc => (
              <button
                key={loc.id} type="button"
                onClick={() => update({ training_location: loc.id })}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
                style={data.training_location === loc.id
                  ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E' }
                  : { background: '#1A1A1A', border: '1px solid #2A2A2A' }
                }
              >
                <span className="text-xl">{loc.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{loc.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#B3B3B3' }}>{loc.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Days per week */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Days per week: <span style={{ color: '#22C55E' }}>{data.training_days_per_week}</span>
          </label>
          <input
            type="range" min={2} max={6}
            value={data.training_days_per_week}
            onChange={e => update({ training_days_per_week: Number(e.target.value) })}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#666' }}>
            <span>2 days</span><span>6 days</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Workout duration: <span style={{ color: '#22C55E' }}>{data.workout_duration_minutes} min</span>
          </label>
          <div className="flex gap-2">
            {[30, 45, 60, 75, 90].map(d => (
              <button
                key={d} type="button"
                onClick={() => update({ workout_duration_minutes: d })}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={data.workout_duration_minutes === d
                  ? { background: '#22C55E', color: 'black' }
                  : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
                }
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Preferred time */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">Preferred workout time</label>
          <div className="grid grid-cols-2 gap-2">
            {times.map(t => (
              <button
                key={t.id} type="button"
                onClick={() => update({ preferred_workout_time: t.id })}
                className="py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={data.preferred_workout_time === t.id
                  ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E', color: 'white' }
                  : { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#B3B3B3' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding/lifestyle')}
          className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}
