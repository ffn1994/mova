'use client'

import { useState } from 'react'
import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { WorkoutEditor } from '@/components/workout/WorkoutEditor'
import { WorkoutFormInputs } from '@/types'

export default function WorkoutPage() {
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [lastInputs, setLastInputs] = useState<WorkoutFormInputs | null>(null)

  async function generate(inputs: WorkoutFormInputs) {
    setLastInputs(inputs)
    setContent('')
    setGenerating(true)

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      })

      if (!response.ok || !response.body) throw new Error('Generation failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content ?? ''
            if (delta) setContent(prev => prev + delta)
          } catch {
            // ignore malformed SSE chunks
          }
        }
      }
    } catch (err) {
      setContent(`Error generating workout plan: ${String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Workout Generator</h1>
      <p className="text-gray-500 mb-8">Tell us about yourself and we&apos;ll build your plan.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-gray-700 mb-4">Your Profile</h2>
          <WorkoutForm onGenerate={generate} loading={generating} />
        </div>

        {(content || generating) && lastInputs && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-4">Your Plan</h2>
            <WorkoutEditor
              content={content}
              inputs={lastInputs}
              onRegenerate={() => lastInputs && generate(lastInputs)}
              generating={generating}
            />
          </div>
        )}
      </div>
    </div>
  )
}
