import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamCompletion, buildChatMessages } from '@/lib/openrouter'
import { SYSTEM_PROMPT_CHAT } from '@/lib/prompts'
import { ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { sessionId, message } = await request.json()

  if (!sessionId || !message) {
    return new Response('Missing sessionId or message', { status: 400 })
  }

  // Save user message
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // Load recent history (last 20 messages)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages = buildChatMessages(
    SYSTEM_PROMPT_CHAT,
    (history ?? []) as Pick<ChatMessage, 'role' | 'content'>[],
    message
  )

  let stream: ReadableStream<Uint8Array>
  try {
    stream = await streamCompletion(messages)
  } catch (err) {
    return new Response(`AI error: ${String(err)}`, { status: 502 })
  }

  // Accumulate full response to save after stream ends
  const [streamForClient, streamForSaving] = stream.tee()

  // Save assistant message after stream completes (fire-and-forget)
  ;(async () => {
    const reader = streamForSaving.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      // Parse SSE lines to extract text content
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          fullContent += parsed.choices?.[0]?.delta?.content ?? ''
        } catch {
          // ignore malformed chunks
        }
      }
    }

    if (fullContent) {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'assistant',
        content: fullContent,
      })
    }
  })()

  return new Response(streamForClient, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
