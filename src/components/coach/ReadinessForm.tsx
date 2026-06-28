'use client'

import { useState } from 'react'
import { DailyReadiness } from '@/types'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  onSubmit: (readiness: DailyReadiness) => void
  loading: boolean
}

interface SliderFieldProps {
  label: string
  name: string
  value: number
  min: number
  max: number
  lowLabel: string
  highLabel: string
  onChange: (v: number) => void
}

function SliderField({ label, value, min, max, lowLabel, highLabel, onChange }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100
  const color = pct >= 60 ? 'text-green-500' : pct >= 30 ? 'text-amber-500' : 'text-red-500'

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={`text-sm font-bold ${color}`}>{value}/{max}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-green-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
    </div>
  )
}

export function ReadinessForm({ onSubmit, loading }: Props) {
  const { t } = useLanguage()
  const [form, setForm] = useState<DailyReadiness>({
    sleep_hours: 7,
    sleep_quality: 3,
    energy_level: 3,
    physical_work_fatigue: 0,
    stress_level: 2,
    hydration: 3,
    nutrition_yesterday: 3,
    user_fatigue: 2,
    notes: '',
  })

  function set<K extends keyof DailyReadiness>(key: K, value: DailyReadiness[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  const workLoads = [
    { value: 0 as const, label: t('sedentary') },
    { value: 1 as const, label: t('light') },
    { value: 2 as const, label: t('moderate') },
    { value: 3 as const, label: t('heavy') },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{t('sleepDuration')}</label>
          <span className="text-sm font-bold text-green-500">{form.sleep_hours}h</span>
        </div>
        <input type="range" min={3} max={12} step={0.5} value={form.sleep_hours}
          onChange={e => set('sleep_hours', Number(e.target.value))}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>3h</span><span>12h</span></div>
      </div>

      <SliderField label={t('sleepQuality')} name="sleep_quality" value={form.sleep_quality} min={1} max={5}
        lowLabel={t('terrible')} highLabel={t('perfect')} onChange={v => set('sleep_quality', v)} />

      <SliderField label={t('energyLevel')} name="energy_level" value={form.energy_level} min={1} max={5}
        lowLabel={t('drained')} highLabel={t('energized')} onChange={v => set('energy_level', v)} />

      <SliderField label={t('perceivedFatigue')} name="user_fatigue" value={form.user_fatigue} min={1} max={5}
        lowLabel={t('fresh')} highLabel={t('exhausted')} onChange={v => set('user_fatigue', v)} />

      <SliderField label={t('stressLevel')} name="stress_level" value={form.stress_level} min={1} max={5}
        lowLabel={t('calm')} highLabel={t('veryStressed')} onChange={v => set('stress_level', v)} />

      <SliderField label={t('hydration')} name="hydration" value={form.hydration} min={1} max={5}
        lowLabel={t('dehydrated')} highLabel={t('wellHydrated')} onChange={v => set('hydration', v)} />

      <SliderField label={t('nutritionQuality')} name="nutrition_yesterday" value={form.nutrition_yesterday} min={1} max={5}
        lowLabel={t('poor')} highLabel={t('excellent')} onChange={v => set('nutrition_yesterday', v)} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('physicalWorkLoad')}</label>
        <div className="flex gap-2">
          {workLoads.map(({ value, label }) => (
            <button key={value} type="button"
              onClick={() => set('physical_work_fatigue', value)}
              className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${form.physical_work_fatigue === value ? 'border-green-500 bg-green-500/10 text-green-500 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesLabel')}</label>
        <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
          rows={2} placeholder={t('notesPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {loading ? t('analyzingReadiness') : t('getDailyPlan')}
      </Button>
    </form>
  )
}
