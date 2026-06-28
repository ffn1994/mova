'use client'

import { useState } from 'react'
import { WorkoutFormInputs } from '@/types'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  onGenerate: (inputs: WorkoutFormInputs) => void
  loading: boolean
}

export function WorkoutForm({ onGenerate, loading }: Props) {
  const { t } = useLanguage()
  const [inputs, setInputs] = useState<WorkoutFormInputs>({
    goal: 'build_muscle',
    daysPerWeek: 3,
    fitnessLevel: 'beginner',
    equipment: 'gym',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onGenerate(inputs)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourGoal')}</label>
        <select
          value={inputs.goal}
          onChange={e => setInputs(p => ({ ...p, goal: e.target.value as WorkoutFormInputs['goal'] }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="build_muscle">{t('goalBuildMuscleShort')}</option>
          <option value="lose_weight">{t('goalLoseWeightShort')}</option>
          <option value="improve_endurance">{t('goalEnduranceShort')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('trainingDaysLabel')}: <span className="text-green-500 font-semibold">{inputs.daysPerWeek}</span>
        </label>
        <input
          type="range"
          min={1}
          max={7}
          value={inputs.daysPerWeek}
          onChange={e => setInputs(p => ({ ...p, daysPerWeek: Number(e.target.value) }))}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{t('oneDay')}</span>
          <span>{t('sevenDays')}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('fitnessLevel')}</label>
        <div className="flex gap-2">
          {fitnessLevels.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setInputs(p => ({ ...p, fitnessLevel: value }))}
              className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
                inputs.fitnessLevel === value
                  ? 'border-green-500 bg-green-500/10 text-green-500 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('equipment')}</label>
        <div className="flex gap-2">
          {equipmentOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setInputs(p => ({ ...p, equipment: value }))}
              className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
                inputs.equipment === value
                  ? 'border-green-500 bg-green-500/10 text-green-500 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {t('generateBtn')}
      </Button>
    </form>
  )
}
