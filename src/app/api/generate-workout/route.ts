import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamCompletion } from '@/lib/openrouter'
import { buildWorkoutPrompt } from '@/lib/prompts'
import { WorkoutFormInputs } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const inputs: WorkoutFormInputs = await request.json()

  const prompt = buildWorkoutPrompt(inputs)
  const messages = [
    { role: 'system' as const, content: 'You are an expert personal trainer. Generate detailed, practical workout plans.' },
    { role: 'user' as const, content: prompt },
  ]

  let stream: ReadableStream<Uint8Array>
  try {
    stream = await streamCompletion(messages)
  } catch (err) {
    return new Response(`AI error: ${String(err)}`, { status: 502 })
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
