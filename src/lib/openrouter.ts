const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function streamCompletion(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Mova',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-6',
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${error}`)
  }

  return response.body!
}

export function buildChatMessages(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Message[] {
  return [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20), // keep last 20 messages
    { role: 'user', content: userMessage },
  ]
}
