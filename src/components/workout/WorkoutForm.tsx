'use client'

import { useState } from 'react'
import { WorkoutFormInputs } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props {
  onGenerate: (inputs: WorkoutFormInputs) => void
  loading: boolean
}

export function WorkoutForm({ onGenerate, loading }: Props) {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Goal</label>
        <select
          value={inputs.goal}
          onChange={e => setInputs(p => ({ ...p, goal: e.target.value as WorkoutFormInputs['goal'] }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="build_muscle">Build Muscle</option>
          <option value="lose_weight">Lose Weight</option>
          <option value="improve_endurance">Improve Endurance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Training Days Per Week: <span className="text-green-600 font-semibold">{inputs.daysPerWeek}</span>
        </label>
        <input
          type="range"
          min={1}
          max={7}
          value={inputs.daysPerWeek}
          onChange={e => setInputs(p => ({ ...p, daysPerWeek: Number(e.target.value) }))}
          className="w-full accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 day</span>
          <span>7 days</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Level</label>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setInputs(p => ({ ...p, fitnessLevel: level }))}
              className={`flex-1 rounded-lg border py-2 text-sm capitalize transition-colors ${
                inputs.fitnessLevel === level
                  ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
        <div className="flex gap-2">
          {([
            { value: 'none', label: 'Bodyweight' },
            { value: 'dumbbells', label: 'Dumbbells' },
            { value: 'gym', label: 'Full Gym' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setInputs(p => ({ ...p, equipment: value }))}
              className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
                inputs.equipment === value
                  ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Generate Workout Plan
      </Button>
    </form>
  )
}
