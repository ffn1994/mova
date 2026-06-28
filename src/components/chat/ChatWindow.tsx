'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage } from '@/types'
import { MessageBubble } from './MessageBubble'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
  sessionId: string | null
}

export function ChatWindow({ sessionId }: Props) {
  const [messages, setMessages] = useState<Pick<ChatMessage, 'role' | 'content'>[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const supabase = createClient()

  async function loadHistory(sid: string) {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
      .limit(50)
    setMessages((data as Pick<ChatMessage, 'role' | 'content'>[]) ?? [])
    setLoadingHistory(false)
  }

  useEffect(() => {
    if (sessionId) {
      setMessages([])
      loadHistory(sessionId)
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !sessionId || streaming) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setStreaming(true)

    // Add empty assistant bubble
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMessage }),
      })

      if (!response.ok || !response.body) throw new Error('Stream failed')

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
            if (delta) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: (updated[updated.length - 1].content ?? '') + delta,
                }
                return updated
              })
            }
          } catch {
            // ignore malformed SSE chunks
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: t('somethingWentWrong'),
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm" style={{ color: '#666' }}>
        {t('selectChatPrompt')}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: '#666' }}>
            {t('askAnything')}
          </p>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 flex gap-2" style={{ borderTop: '1px solid #2A2A2A' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('askCoachPlaceholder')}
          disabled={streaming}
          className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
        />
        <Button type="submit" loading={streaming} disabled={!input.trim()}>
          {t('send')}
        </Button>
      </form>
    </div>
  )
}
