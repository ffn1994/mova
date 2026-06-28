'use client'

import { useState, useTransition } from 'react'
import { saveUserProfile } from '@/actions/coach'
import { UserFitnessProfile } from '@/types'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  onComplete: () => void
}

export function ProfileSetup({ onComplete }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()
  const [form, setForm] = useState<Omit<UserFitnessProfile, 'user_id'>>({
    goal: 'build_muscle',
    fitness_level: 'intermediate',
    days_per_week: 4,
    equipment: 'gym',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveUserProfile(form)
      if (result.error) setError(result.error)
      else onComplete()
    })
  }

  const fitnessLevels = [
    { value: 'beginner' as const, label: t('beginner') },
    { value: 'intermediate' as const, label: t('intermediate') },
    { value: 'advanced' as const, label: t('advanced') },
  ]

  const equipmentOptions = [
    { value: 'none' as const, label: t('bodyweight') },
    { value: 'dumbbells' as const, label: t('dumbbells') },
    { value: 'gym' as const, label: t('fullGym') },
  ]

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('setupProfile')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('setupProfileDesc')}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('primaryGoal')}</label>
          <select
            value={form.goal}
            onChange={e => setForm(p => ({ ...p, goal: e.target.value as UserFitnessProfile['goal'] }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="build_muscle">{t('goalBuildMuscle')}</option>
            <option value="lose_weight">{t('goalLoseWeight')}</option>
            <option value="improve_endurance">{t('goalEndurance')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fitnessLevel')}</label>
          <div className="flex gap-2">
            {fitnessLevels.map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm(p => ({ ...p, fitness_level: value }))}
                className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${form.fitness_level === value ? 'border-green-500 bg-green-500/10 text-green-500 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('trainingDaysPerWeek')}: <span className="text-green-500 font-semibold">{form.days_per_week}</span>
          </label>
          <input type="range" min={1} max={7} value={form.days_per_week}
            onChange={e => setForm(p => ({ ...p, days_per_week: Number(e.target.value) }))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>7</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipmentAvailable')}</label>
          <div className="flex gap-2">
            {equipmentOptions.map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm(p => ({ ...p, equipment: value }))}
                className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${form.equipment === value ? 'border-green-500 bg-green-500/10 text-green-500 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button type="submit" loading={pending}>{t('saveProfileBtn')}</Button>
      </form>
    </div>
  )
}
