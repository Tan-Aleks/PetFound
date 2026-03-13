import { type Message, getSupabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useState } from 'react'

type PetPreview = {
  id: string
  name: string | null
  status: 'lost' | 'found'
}

type ProfilePreview = {
  id: string
  name: string | null
  email: string | null
}

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
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      setMessages(data || [])
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

  const fetchConversations = useCallback(async (userId: string) => {
    try {
      setConversationsLoading(true)
      setError(null)
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const source = data || []
      const petIds = Array.from(
        new Set(source.map((item) => item.pet_id).filter(Boolean)),
      ) as string[]
      const profileIds = Array.from(
        new Set(
          source
            .flatMap((item) => [item.sender_id, item.receiver_id])
            .filter((id) => id && id !== userId),
        ),
      ) as string[]

      let petsMap = new Map<string, PetPreview>()
      if (petIds.length > 0) {
        const { data: petsData } = await supabase
          .from('pets')
          .select('id,name,status')
          .in('id', petIds)

        petsMap = new Map(
          (petsData || []).map((pet) => [
            pet.id,
            {
              id: pet.id,
              name: pet.name,
              status: pet.status,
            },
          ]),
        )
      }

      let profilesMap = new Map<string, ProfilePreview>()
      if (profileIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase.rpc(
          'get_profile_previews',
          {
            profile_ids: profileIds,
          },
        )

        if (profilesError) {
          throw profilesError
        }

        profilesMap = new Map(
          (profilesData || []).map((profile) => [
            profile.id,
            {
              id: profile.id,
              name: profile.name,
              email: profile.email,
            },
          ]),
        )
      }

      const grouped = new Map<string, ConversationItem>()

      for (const message of source) {
        const petId = message.pet_id
        const senderId = message.sender_id
        const receiverId = message.receiver_id
        if (!petId || !senderId || !receiverId) {
          continue
        }

        const counterpartId = senderId === userId ? receiverId : senderId
        const key = `${petId}:${counterpartId}`
        const pet = petsMap.get(petId)
        const counterpart = profilesMap.get(counterpartId)

        const existing = grouped.get(key)
        const unreadIncrement =
          message.receiver_id === userId && message.read !== true ? 1 : 0

        if (!existing) {
          grouped.set(key, {
            key,
            petId,
            petName: pet?.name || 'Без имени',
            petStatus: pet?.status || 'lost',
            counterpartId,
            counterpartName:
              counterpart?.name ||
              counterpart?.email ||
              'Неизвестный собеседник',
            lastMessage: message.content,
            lastMessageAt: message.created_at,
            unreadCount: unreadIncrement,
          })
          continue
        }

        grouped.set(key, {
          ...existing,
          unreadCount: existing.unreadCount + unreadIncrement,
        })
      }

      setConversations(
        Array.from(grouped.values()).sort((a, b) =>
          (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''),
        ),
      )
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
