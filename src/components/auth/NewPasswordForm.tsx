'use client'

import { useTransition, useState } from 'react'
import { updatePassword } from '@/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function sanitize(s: string) {
  return s.split('').filter(c => c.charCodeAt(0) <= 255).join('').trim()
}

export function NewPasswordForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const password = sanitize((form.elements.namedItem('password') as HTMLInputElement).value)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    startTransition(async () => {
      const result = await updatePassword(password)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="password"
        name="password"
        type="password"
        label="New Password"
        placeholder="Min. 8 characters"
        required
        minLength={8}
        autoComplete="new-password"
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        Update Password
      </Button>
    </form>
  )
}
