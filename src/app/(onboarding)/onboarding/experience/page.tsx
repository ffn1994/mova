'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'

export default function ExperiencePage() {
  const router = useRouter()
  const { data, update } = useOnboarding()

  const inputStyle: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: 'white' }

  return (
    <OnboardingShell
      step={3}
      totalSteps={6}
      title="Your Training History"
      subtitle="The AI uses this to determine your starting level"
      onBack={() => router.push('/onboarding/goal')}
    >
      <div className="flex flex-col gap-5">
        {/* Have you trained before? */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">Have you trained with weights before?</label>
          <div className="flex gap-3">
            {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map(({ v, label }) => (
              <button
                key={label} type="button"
                onClick={() => update({ has_trained_before: v })}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={data.has_trained_before === v
                  ? { background: '#22C55E', color: 'black' }
                  : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {data.has_trained_before && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Years of training experience</label>
              <select
                value={data.years_experience}
                onChange={e => update({ years_experience: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                style={inputStyle}
              >
                <option value="0.5" style={{ background: '#1A1A1A' }}>Less than 1 year</option>
                <option value="1" style={{ background: '#1A1A1A' }}>1 year</option>
                <option value="2" style={{ background: '#1A1A1A' }}>2 years</option>
                <option value="3" style={{ background: '#1A1A1A' }}>3 years</option>
                <option value="5" style={{ background: '#1A1A1A' }}>4-5 years</option>
                <option value="7" style={{ background: '#1A1A1A' }}>6-10 years</option>
                <option value="10" style={{ background: '#1A1A1A' }}>10+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-white">Current training status</label>
              <div className="flex flex-col gap-2">
                {[
                  { v: 'active', label: '✅ Currently training consistently', is_active: true, recently_stopped: false },
                  { v: 'stopped', label: '⏸️ Was training, stopped recently (< 3 months)', is_active: false, recently_stopped: true },
                  { v: 'inactive', label: '💤 Haven\'t trained in a while (3+ months)', is_active: false, recently_stopped: false },
                ].map(opt => {
                  const isSelected = data.is_currently_active === opt.is_active && data.recently_stopped === opt.recently_stopped
                  return (
                    <button
                      key={opt.v} type="button"
                      onClick={() => update({ is_currently_active: opt.is_active, recently_stopped: opt.recently_stopped })}
                      className="p-3.5 rounded-xl text-sm text-left transition-all active:scale-95"
                      style={isSelected
                        ? { background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E', color: 'white' }
                        : { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#B3B3B3' }
                      }
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => router.push('/onboarding/preferences')}
          className="w-full py-4 rounded-2xl font-bold text-base text-black mt-2 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}
