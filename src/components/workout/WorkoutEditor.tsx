'use client'

import { useState, useEffect } from 'react'
import { WorkoutFormInputs } from '@/types'
import { saveWorkout } from '@/actions/workout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  content: string
  inputs: WorkoutFormInputs
  onRegenerate: () => void
  generating: boolean
}

export function WorkoutEditor({ content, inputs, onRegenerate, generating }: Props) {
  const [editedContent, setEditedContent] = useState(content)
  const [title, setTitle] = useState('My Workout Plan')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync editable content when a new generation finishes
  useEffect(() => {
    if (!generating) setEditedContent(content)
  }, [generating, content])

  async function handleSave() {
    setSaving(true)
    setError(null)
    const result = await saveWorkout(editedContent, title, inputs)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="plan-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        label="Plan Title"
        placeholder="My Workout Plan"
      />

      <textarea
        value={generating ? content : editedContent}
        onChange={e => setEditedContent(e.target.value)}
        readOnly={generating}
        rows={20}
        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm font-mono leading-relaxed focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-y disabled:bg-gray-50"
        placeholder="Your workout plan will appear here..."
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onRegenerate} disabled={generating} className="flex-1">
          Regenerate
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={generating || !editedContent.trim()}
          className="flex-1"
        >
          {saved ? 'Saved!' : 'Save Plan'}
        </Button>
      </div>
    </div>
  )
}
