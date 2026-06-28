'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface OnboardingData {
  // Step 1: Personal
  first_name: string
  age: string
  gender: string
  height_cm: string
  weight_kg: string
  country: string
  unit_preference: 'kg' | 'lb'
  // Step 2: Goal
  fitness_goal: string
  // Step 3: Experience
  has_trained_before: boolean
  years_experience: string
  is_currently_active: boolean
  recently_stopped: boolean
  // Step 4: Preferences
  training_location: string
  training_days_per_week: number
  workout_duration_minutes: number
  preferred_workout_time: string
  // Step 5: Lifestyle
  job_type: string
  daily_activity_level: string
  avg_sleep_hours: number
  stress_level: string
  avg_daily_steps: string
  // Step 6: Health
  has_injuries: boolean
  injury_details: string
  has_medical_conditions: boolean
  medical_details: string
  has_pain: boolean
  pain_details: string
  exercises_to_avoid: string
}

const defaults: OnboardingData = {
  first_name: '', age: '', gender: '', height_cm: '', weight_kg: '',
  country: '', unit_preference: 'kg',
  fitness_goal: '',
  has_trained_before: false, years_experience: '0', is_currently_active: false, recently_stopped: false,
  training_location: 'gym', training_days_per_week: 4, workout_duration_minutes: 60, preferred_workout_time: 'flexible',
  job_type: '', daily_activity_level: 'moderate', avg_sleep_hours: 7, stress_level: 'moderate', avg_daily_steps: '5000',
  has_injuries: false, injury_details: '', has_medical_conditions: false, medical_details: '',
  has_pain: false, pain_details: '', exercises_to_avoid: '',
}

interface OnboardingContextType {
  data: OnboardingData
  update: (patch: Partial<OnboardingData>) => void
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextType>({
  data: defaults,
  update: () => {},
  reset: () => {},
})

const STORAGE_KEY = 'mova_onboarding'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaults)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setData({ ...defaults, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function update(patch: Partial<OnboardingData>) {
    setData(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setData(defaults)
  }

  return (
    <OnboardingContext.Provider value={{ data, update, reset }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  return useContext(OnboardingContext)
}
