import type { Database } from '@/lib/database.types'
import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabasePublicServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Message = Database['public']['Tables']['messages']['Row']

type ConversationItem = {
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

export async function GET() {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const supabase = getSupabasePublicServer()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${auth.userId},receiver_id.eq.${auth.userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const source = (data || []) as Message[]
    const petIds = Array.from(
      new Set(source.map((item) => item.pet_id).filter(Boolean)),
    ) as string[]
    const profileIds = Array.from(
      new Set(
        source
          .flatMap((item) => [item.sender_id, item.receiver_id])
          .filter((id) => id && id !== auth.userId),
      ),
    ) as string[]

    let petsMap = new Map<
      string,
      { id: string; name: string | null; status: 'lost' | 'found' }
    >()
    if (petIds.length > 0) {
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id,name,status')
        .in('id', petIds)

      if (petsError) {
        throw petsError
      }

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

    let profilesMap = new Map<
      string,
      { id: string; name: string | null; email: string | null }
    >()
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

      const counterpartId = senderId === auth.userId ? receiverId : senderId
      const key = `${petId}:${counterpartId}`
      const pet = petsMap.get(petId)
      const counterpart = profilesMap.get(counterpartId)
      const existing = grouped.get(key)
      const unreadIncrement =
        receiverId === auth.userId && message.read !== true ? 1 : 0

      if (!existing) {
        grouped.set(key, {
          key,
          petId,
          petName: pet?.name || 'Без имени',
          petStatus: pet?.status || 'lost',
          counterpartId,
          counterpartName:
            counterpart?.name || counterpart?.email || 'Неизвестный собеседник',
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

    return NextResponse.json({
      conversations: Array.from(grouped.values()).sort((a, b) =>
        (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''),
      ),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить диалоги',
      },
      { status: 500 },
    )
  }
}
