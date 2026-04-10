import { AI_MATCH_SUGGESTIONS, type AiMatchContext } from '@/lib/ai-match-chat'
import type { Database } from '@/lib/database.types'
import { useCallback, useState } from 'react'

export type AiMatchMessage =
  Database['public']['Tables']['ai_match_messages']['Row']

export type AiConversationItem = {
  kind: 'ai'
  lastMessage: string
  lastMessageAt: string | null
  matchId: string
  petId: string
  petName: string
  similarityPercent: number
  sourceName: string
  title: string
  unreadCount: number
}

export function useAiMatchChat() {
  const [conversations, setConversations] = useState<AiConversationItem[]>([])
  const [messages, setMessages] = useState<AiMatchMessage[]>([])
  const [context, setContext] = useState<AiMatchContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true)
      setError(null)

      const response = await fetch('/api/ai-match-chat/conversations', {
        cache: 'no-store',
      })
      const payload = (await response.json()) as {
        conversations?: AiConversationItem[]
        error?: string
      }

      if (!response.ok || !payload.conversations) {
        throw new Error(payload.error || 'Не удалось загрузить AI-диалоги')
      }

      setConversations(payload.conversations)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить AI-диалоги',
      )
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  const fetchThread = useCallback(async (matchId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/ai-match-chat/${matchId}`, {
        cache: 'no-store',
      })
      const payload = (await response.json()) as {
        context?: AiMatchContext
        error?: string
        messages?: AiMatchMessage[]
      }

      if (!response.ok || !payload.context || !payload.messages) {
        throw new Error(payload.error || 'Не удалось загрузить AI-чат')
      }

      setContext(payload.context)
      setMessages(payload.messages)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить AI-чат',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (matchId: string, content: string) => {
    try {
      setSending(true)
      setError(null)

      const response = await fetch(`/api/ai-match-chat/${matchId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      const payload = (await response.json()) as {
        error?: string
        messages?: AiMatchMessage[]
      }

      if (!response.ok || !payload.messages) {
        throw new Error(payload.error || 'Не удалось отправить сообщение AI')
      }

      setMessages((prev) => [...prev, ...(payload.messages ?? [])])
      return payload.messages
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : 'Не удалось отправить сообщение AI'
      setError(nextError)
      throw new Error(nextError)
    } finally {
      setSending(false)
    }
  }, [])

  return {
    context,
    conversations,
    conversationsLoading,
    error,
    fetchConversations,
    fetchThread,
    loading,
    messages,
    sending,
    sendMessage,
    suggestions: AI_MATCH_SUGGESTIONS,
  }
}
