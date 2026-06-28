'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOnboarding } from '@/context/OnboardingContext'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { getActiveProgram } from '@/actions/onboarding'

function PersonalPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, update } = useOnboarding()

  useEffect(() => {
    if (searchParams.get('rebuild')) return
    getActiveProgram().then(prog => {
      if (prog) router.replace('/app/dashboard')
    })
  }, [router, searchParams])

  function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push('/onboarding/goal')
  }

  const inputStyle: React.CSSProperties = {
    background: '#1A1A1A',
    border: '1px solid #2A2A2A',
    color: 'white',
  }

  return (
    <OnboardingShell
      step={1}
      totalSteps={6}
      title="Personal Information"
      subtitle="Help us tailor your program"
      onBack={() => router.push('/welcome')}
    >
      <form onSubmit={handleContinue} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-white">First Name</label>
            <input
              type="text" required placeholder="Your name"
              value={data.first_name}
              onChange={e => update({ first_name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Age</label>
            <input
              type="number" required placeholder="25" min="13" max="100"
              value={data.age}
              onChange={e => update({ age: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">Gender</label>
            <select
              required value={data.gender}
              onChange={e => update({ gender: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              style={{ ...inputStyle, color: data.gender ? 'white' : '#4B5563' }}
            >
              <option value="" disabled style={{ background: '#1A1A1A' }}>Select</option>
              <option value="male" style={{ background: '#1A1A1A' }}>Male</option>
              <option value="female" style={{ background: '#1A1A1A' }}>Female</option>
              <option value="other" style={{ background: '#1A1A1A' }}>Other</option>
            </select>
          </div>
        </div>

        {/* Units toggle */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Units</label>
          <div className="flex gap-2">
            {(['kg', 'lb'] as const).map(u => (
              <button
                key={u} type="button"
                onClick={() => update({ unit_preference: u })}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={data.unit_preference === u
                  ? { background: '#22C55E', color: 'black' }
                  : { background: '#1A1A1A', color: '#B3B3B3', border: '1px solid #2A2A2A' }
                }
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Height ({data.unit_preference === 'kg' ? 'cm' : 'in'})
            </label>
            <input
              type="number" required placeholder={data.unit_preference === 'kg' ? '175' : '69'}
              value={data.height_cm}
              onChange={e => update({ height_cm: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Weight ({data.unit_preference})
            </label>
            <input
              type="number" required placeholder={data.unit_preference === 'kg' ? '75' : '165'}
              value={data.weight_kg}
              onChange={e => update({ weight_kg: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl font-bold text-base text-black mt-2 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Continue
        </button>
      </form>
    </OnboardingShell>
  )
}

export default function PersonalPage() {
  return (
    <Suspense>
      <PersonalPageInner />
    </Suspense>
  )
}
