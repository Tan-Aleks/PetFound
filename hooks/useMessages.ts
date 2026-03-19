import { type Message, getSupabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useState } from 'react'

export type ConversationItem = {
  key: string
  petId: string
  petName: string
  petStatus: 'lost' | 'found'
  counterpartId: string
  counterpartName: string
  lastMessage: string
  lastMessageAt: string | null
  unreadCount: number
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upsertMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === message.id)
      if (existingIndex === -1) {
        return [...prev, message].sort((a, b) =>
          (a.created_at || '').localeCompare(b.created_at || ''),
        )
      }

      const next = [...prev]
      next[existingIndex] = message
      return next
    })
  }, [])

  const fetchMessages = useCallback(async (petId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/messages?petId=${petId}`, {
        cache: 'no-store',
      })
      const payload = (await response.json()) as {
        error?: string
        messages?: Message[]
      }

      if (!response.ok || !payload.messages) {
        throw new Error(
          payload.error || 'Произошла ошибка при загрузке сообщений',
        )
      }

      setMessages(payload.messages)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при загрузке сообщений',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConversations = useCallback(async (_userId: string) => {
    try {
      setConversationsLoading(true)
      setError(null)
      const response = await fetch('/api/messages/conversations', {
        cache: 'no-store',
      })
      const payload = (await response.json()) as {
        error?: string
        conversations?: ConversationItem[]
      }

      if (!response.ok || !payload.conversations) {
        throw new Error(
          payload.error || 'Произошла ошибка при загрузке диалогов',
        )
      }

      setConversations(payload.conversations)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при загрузке диалогов',
      )
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (params: {
      petId: string
      receiverId: string
      content: string
    }) => {
      const text = params.content.trim()
      if (!text) {
        throw new Error('Сообщение не может быть пустым')
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          petId: params.petId,
          receiverId: params.receiverId,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        message?: Message
      }

      if (!response.ok || !payload.message) {
        throw new Error(payload.error || 'Ошибка при отправке сообщения')
      }

      upsertMessage(payload.message)
      return payload.message
    },
    [upsertMessage],
  )

  const markPetMessagesAsRead = useCallback(
    async (petId: string, userId: string) => {
      const unreadIds = messages
        .filter(
          (message) =>
            message.pet_id === petId &&
            message.receiver_id === userId &&
            message.read !== true,
        )
        .map((message) => message.id)

      if (unreadIds.length === 0) {
        return
      }

      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds: unreadIds,
          petId,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        updatedIds?: string[]
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Ошибка обновления статуса сообщений')
      }

      setMessages((prev) =>
        prev.map((message) =>
          unreadIds.includes(message.id) ? { ...message, read: true } : message,
        ),
      )
    },
    [messages],
  )

  const subscribeToPetMessages = useCallback(
    (petId: string, onError?: (errorMessage: string) => void) => {
      const supabase = getSupabase()
      const channel: RealtimeChannel = supabase
        .channel(`chat:${petId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `pet_id=eq.${petId}`,
          },
          (payload) => {
            if (
              payload.eventType === 'INSERT' ||
              payload.eventType === 'UPDATE'
            ) {
              upsertMessage(payload.new as Message)
            }
          },
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' && onError) {
            onError('Ошибка realtime-подписки чата')
          }
        })

      return () => {
        void supabase.removeChannel(channel)
      }
    },
    [upsertMessage],
  )

  return {
    messages,
    conversations,
    loading,
    conversationsLoading,
    error,
    fetchMessages,
    fetchConversations,
    sendMessage,
    markPetMessagesAsRead,
    subscribeToPetMessages,
  }
}
