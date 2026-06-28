import { ChatMessage } from '@/types'

export function MessageBubble({ message }: { message: Pick<ChatMessage, 'role' | 'content'> }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'bg-green-500 text-black rounded-br-sm' : 'text-white rounded-bl-sm'
        }`}
        style={isUser ? {} : { background: '#1A1A1A', border: '1px solid #2A2A2A' }}
      >
        {message.content}
      </div>
    </div>
  )
}
