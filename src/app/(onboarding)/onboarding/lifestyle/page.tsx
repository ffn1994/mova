'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'

const jobTypes = [
  { id: 'sedentary', label: '💻 Desk / Office' },
  { id: 'light', label: '🚶 Light activity' },
  { id: 'moderate', label: '⚙️ Moderate (standing, walking)' },
  { id: 'active', label: '🏗️ Very active / physical job' },
]

const stressLevels = [
  { id: 'low', label: '😌 Low' },
  { id: 'moderate', label: '😐 Moderate' },
  { id: 'high', label: '😓 High' },
  { id: 'very_high', label: '🤯 Very High' },
]

export default function LifestylePage() {
  const router = useRouter()
  const { data, update } = useOnboarding()

  const inputStyle: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: 'white' }

  return (
    <OnboardingShell
      step={5}
      totalSteps={6}
      title="Your Lifestyle"
      subtitle="Recovery is as important as training"
      onBack={() => router.push('/onboarding/preferences')}
    >
      <div className="flex flex-col gap-5">
        {/* Job type */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">What does your typical day look like?</label>
          <div className="flex flex-col gap-2">
            {jobTypes.map(j => (
              <button
                key={j.id} type="button"
                onClick={() => update({ job_type: j.id, daily_activity_level: j.id })}
                className="p-3.5 rounded-xl text-sm text-left transition-all active:scale-95"
                style={data.job_type === j.id
                  ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E', color: 'white' }
                  : { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#B3B3B3' }
                }
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Average sleep: <span style={{ color: '#22C55E' }}>{data.avg_sleep_hours}h</span>
          </label>
          <input
            type="range" min={4} max={10} step={0.5}
            value={data.avg_sleep_hours}
            onChange={e => update({ avg_sleep_hours: Number(e.target.value) })}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#666' }}>
            <span>4h</span><span>10h</span>
          </div>
        </div>

        {/* Stress */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">Overall stress level</label>
          <div className="grid grid-cols-2 gap-2">
            {stressLevels.map(s => (
              <button
                key={s.id} type="button"
                onClick={() => update({ stress_level: s.id })}
                className="py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={data.stress_level === s.id
                  ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E', color: 'white' }
                  : { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#B3B3B3' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily steps */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Avg. daily steps: <span style={{ color: '#22C55E' }}>{Number(data.avg_daily_steps).toLocaleString()}</span>
          </label>
          <input
            type="range" min={1000} max={20000} step={500}
            value={data.avg_daily_steps}
            onChange={e => update({ avg_daily_steps: e.target.value })}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#666' }}>
            <span>1k</span><span>20k</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding/health')}
          className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}
