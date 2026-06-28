'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'

export default function HealthPage() {
  const router = useRouter()
  const { data, update } = useOnboarding()

  const textareaStyle: React.CSSProperties = {
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    color: 'white',
    resize: 'none',
  }

  const YesNoToggle = ({
    label, value, onChange
  }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div>
      <label className="block text-sm font-medium mb-2 text-white">{label}</label>
      <div className="flex gap-2">
        {[{ v: false, label: 'No' }, { v: true, label: 'Yes' }].map(opt => (
          <button
            key={String(opt.v)} type="button"
            onClick={() => onChange(opt.v)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={value === opt.v
              ? { background: '#22C55E', color: 'black' }
              : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <OnboardingShell
      step={6}
      totalSteps={6}
      title="Health & Limitations"
      subtitle="We'll keep your program safe and effective"
      onBack={() => router.push('/onboarding/lifestyle')}
    >
      <div className="flex flex-col gap-5">
        <YesNoToggle
          label="Do you have any injuries?"
          value={data.has_injuries}
          onChange={v => update({ has_injuries: v })}
        />
        {data.has_injuries && (
          <textarea
            rows={2} placeholder="Describe your injuries (e.g., left knee pain, shoulder impingement)"
            value={data.injury_details}
            onChange={e => update({ injury_details: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
            style={textareaStyle}
          />
        )}

        <YesNoToggle
          label="Any medical conditions we should know about?"
          value={data.has_medical_conditions}
          onChange={v => update({ has_medical_conditions: v })}
        />
        {data.has_medical_conditions && (
          <textarea
            rows={2} placeholder="E.g., high blood pressure, diabetes, heart condition"
            value={data.medical_details}
            onChange={e => update({ medical_details: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
            style={textareaStyle}
          />
        )}

        <YesNoToggle
          label="Any chronic pain or discomfort areas?"
          value={data.has_pain}
          onChange={v => update({ has_pain: v })}
        />
        {data.has_pain && (
          <textarea
            rows={2} placeholder="E.g., lower back pain, knee discomfort"
            value={data.pain_details}
            onChange={e => update({ pain_details: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
            style={textareaStyle}
          />
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-white">Any exercises to avoid? (optional)</label>
          <textarea
            rows={2} placeholder="E.g., no squats, avoid overhead pressing"
            value={data.exercises_to_avoid}
            onChange={e => update({ exercises_to_avoid: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
            style={textareaStyle}
          />
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding/analyzing')}
          className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Build My Program
        </button>
      </div>
    </OnboardingShell>
  )
}
