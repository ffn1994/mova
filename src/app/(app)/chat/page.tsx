'use client'

import { useState } from 'react'
import { SessionSidebar } from '@/components/chat/SessionSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  return (
    <div className="flex flex-1 min-h-0 h-full">
      <SessionSidebar
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
      />
      <ChatWindow sessionId={activeSessionId} />
    </div>
  )
}
