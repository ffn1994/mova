'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatSession } from '@/types'
import { Button } from '@/components/ui/Button'

interface Props {
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
}

export function SessionSidebar({ activeSessionId, onSelectSession }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function loadSessions() {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(30)
    setSessions(data ?? [])
  }

  async function createSession() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single()

    if (data) {
      setSessions(prev => [data, ...prev])
      onSelectSession(data.id)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSessions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-3">
        <Button onClick={createSession} loading={loading} className="w-full" variant="secondary">
          + New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full px-3 py-2 text-left text-sm truncate hover:bg-gray-100 transition-colors ${
              session.id === activeSessionId ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
            }`}
          >
            {session.title}
          </button>
        ))}
        {sessions.length === 0 && (
          <p className="px-3 py-4 text-xs text-gray-400">No chats yet. Start a new one.</p>
        )}
      </div>
    </aside>
  )
}
