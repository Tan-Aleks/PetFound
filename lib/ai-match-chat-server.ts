import 'server-only'

import {
  type AiMatchContext,
  type AiMatchIdentifier,
  buildAiSummary,
  getCrossMatchKey,
  parseCrossMatchKey,
} from '@/lib/ai-match-chat'
import type { Database } from '@/lib/database.types'
import type { getSupabaseServer } from '@/lib/supabase-server'

type SupabaseServerClient = ReturnType<typeof getSupabaseServer>

type InternalPetRow = Pick<
  Database['public']['Tables']['pets']['Row'],
  'date' | 'district' | 'id' | 'name' | 'status' | 'type' | 'user_id'
>

type ExternalPetRow = Pick<
  Database['public']['Tables']['external_pets']['Row'],
  | 'breed'
  | 'color'
  | 'contact_info'
  | 'date'
  | 'description'
  | 'district'
  | 'id'
  | 'name'
  | 'size'
  | 'source_id'
  | 'source_url'
  | 'status'
  | 'type'
>

type ExternalSourceRow = Pick<
  Database['public']['Tables']['external_sources']['Row'],
  'id' | 'name' | 'url'
>

type CrossMatchRow = Pick<
  Database['public']['Tables']['cross_matches']['Row'],
  'external_pet_id' | 'id' | 'internal_pet_id' | 'similarity_score'
>

type AiMatchMessage = Database['public']['Tables']['ai_match_messages']['Row']

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

export async function getAiMatchContextForUser(
  supabase: SupabaseServerClient,
  userId: string,
  identifier: AiMatchIdentifier,
) {
  let matchBuilder = supabase
    .from('cross_matches')
    .select('id, internal_pet_id, external_pet_id, similarity_score')

  if (typeof identifier.matchId === 'string') {
    matchBuilder = matchBuilder.eq('id', identifier.matchId)
  } else {
    const parsed = parseCrossMatchKey(identifier.matchKey)

    if (!parsed) {
      throw new Error('Некорректный идентификатор AI-совпадения')
    }

    matchBuilder = matchBuilder
      .eq('internal_pet_id', parsed.internalPetId)
      .eq('external_pet_id', parsed.externalPetId)
  }

  const { data: match, error: matchError } = await matchBuilder.single()

  if (matchError || !match) {
    throw new Error('AI-совпадение не найдено')
  }

  const { data: internalPet, error: internalPetError } = await supabase
    .from('pets')
    .select('id, user_id, name, type, status, district, date')
    .eq('id', match.internal_pet_id)
    .single()

  if (internalPetError || !internalPet) {
    throw new Error('Внутреннее объявление не найдено')
  }

  if (internalPet.user_id !== userId) {
    throw new Error('Недостаточно прав для просмотра AI-чата')
  }

  const { data: externalPet, error: externalPetError } = await supabase
    .from('external_pets')
    .select(
      'id, source_id, name, type, breed, color, size, district, date, status, description, contact_info, source_url',
    )
    .eq('id', match.external_pet_id)
    .single()

  if (externalPetError || !externalPet) {
    throw new Error('Внешнее объявление не найдено')
  }

  const { data: source } = await supabase
    .from('external_sources')
    .select('id, name, url')
    .eq('id', externalPet.source_id)
    .maybeSingle()

  const context: AiMatchContext = {
    externalPet: externalPet as ExternalPetRow,
    internalPet: internalPet as InternalPetRow,
    matchId: match.id,
    matchKey: getCrossMatchKey(match.internal_pet_id, match.external_pet_id),
    similarityScore: Number(match.similarity_score),
    source: (source as ExternalSourceRow | null) ?? null,
  }

  return context
}

export async function ensureAiAssistantSummary(
  supabase: SupabaseServerClient,
  userId: string,
  context: AiMatchContext,
) {
  const { data: existingMessage, error: existingMessageError } = await supabase
    .from('ai_match_messages')
    .select('id')
    .eq('user_id', userId)
    .eq('match_id', context.matchId)
    .eq('role', 'assistant')
    .eq('topic', 'summary')
    .limit(1)
    .maybeSingle()

  if (existingMessageError) {
    throw existingMessageError
  }

  if (existingMessage) {
    return
  }

  const { error: insertError } = await supabase
    .from('ai_match_messages')
    .insert({
      content: buildAiSummary(context),
      match_id: context.matchId,
      role: 'assistant',
      topic: 'summary',
      user_id: userId,
    })

  if (insertError) {
    throw insertError
  }
}

export async function listAiMatchConversations(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data: messages, error: messagesError } = await supabase
    .from('ai_match_messages')
    .select('id, match_id, role, topic, content, created_at, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (messagesError) {
    throw messagesError
  }

  const typedMessages = (messages ?? []) as AiMatchMessage[]
  const matchIds = Array.from(
    new Set(typedMessages.map((message) => message.match_id)),
  )

  if (matchIds.length === 0) {
    return [] as AiConversationItem[]
  }

  const { data: matches, error: matchesError } = await supabase
    .from('cross_matches')
    .select('id, internal_pet_id, external_pet_id, similarity_score')
    .in('id', matchIds)

  if (matchesError) {
    throw matchesError
  }

  const typedMatches = (matches ?? []) as CrossMatchRow[]
  const internalPetIds = Array.from(
    new Set(typedMatches.map((match) => match.internal_pet_id)),
  )
  const externalPetIds = Array.from(
    new Set(typedMatches.map((match) => match.external_pet_id)),
  )

  const [
    { data: pets, error: petsError },
    { data: externalPets, error: externalPetsError },
  ] = await Promise.all([
    supabase
      .from('pets')
      .select('id, user_id, name, type, status, district, date')
      .in('id', internalPetIds),
    supabase
      .from('external_pets')
      .select(
        'id, source_id, name, type, breed, color, size, district, date, status, description, contact_info, source_url',
      )
      .in('id', externalPetIds),
  ])

  if (petsError) {
    throw petsError
  }

  if (externalPetsError) {
    throw externalPetsError
  }

  const sourceIds = Array.from(
    new Set(
      ((externalPets ?? []) as ExternalPetRow[])
        .map((pet) => pet.source_id)
        .filter(Boolean),
    ),
  )

  const { data: sources, error: sourcesError } = await supabase
    .from('external_sources')
    .select('id, name, url')
    .in('id', sourceIds)

  if (sourcesError) {
    throw sourcesError
  }

  const { data: unreadNotifications, error: notificationsError } =
    await supabase
      .from('notifications')
      .select('id, data')
      .eq('user_id', userId)
      .eq('type', 'match_found')
      .eq('read', false)

  if (notificationsError) {
    throw notificationsError
  }

  const petsById = new Map(
    ((pets ?? []) as InternalPetRow[]).map((pet) => [pet.id, pet]),
  )
  const externalPetsById = new Map(
    ((externalPets ?? []) as ExternalPetRow[]).map((pet) => [pet.id, pet]),
  )
  const sourcesById = new Map(
    ((sources ?? []) as ExternalSourceRow[]).map((source) => [
      source.id,
      source,
    ]),
  )
  const matchesById = new Map(typedMatches.map((match) => [match.id, match]))
  const unreadByMatchKey = new Map<string, number>()

  for (const notification of unreadNotifications ?? []) {
    const data = notification.data
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      continue
    }

    const matchKey =
      'match_key' in data && typeof data.match_key === 'string'
        ? data.match_key
        : null

    if (!matchKey) {
      continue
    }

    unreadByMatchKey.set(matchKey, (unreadByMatchKey.get(matchKey) ?? 0) + 1)
  }

  const latestMessageByMatchId = new Map<string, AiMatchMessage>()

  for (const message of typedMessages) {
    if (!latestMessageByMatchId.has(message.match_id)) {
      latestMessageByMatchId.set(message.match_id, message)
    }
  }

  return Array.from(latestMessageByMatchId.entries())
    .map(([matchId, lastMessage]) => {
      const match = matchesById.get(matchId)
      if (!match) {
        return null
      }

      const pet = petsById.get(match.internal_pet_id)
      const externalPet = externalPetsById.get(match.external_pet_id)

      if (!pet || !externalPet) {
        return null
      }

      const source = sourcesById.get(externalPet.source_id)
      const matchKey = getCrossMatchKey(
        match.internal_pet_id,
        match.external_pet_id,
      )

      return {
        kind: 'ai' as const,
        lastMessage: lastMessage.content,
        lastMessageAt: lastMessage.created_at,
        matchId,
        petId: pet.id,
        petName: pet.name || 'Без имени',
        similarityPercent: Math.round(Number(match.similarity_score) * 100),
        sourceName: source?.name || 'Внешний источник',
        title: 'AI-помощник по совпадению',
        unreadCount: unreadByMatchKey.get(matchKey) ?? 0,
      }
    })
    .filter((item): item is AiConversationItem => Boolean(item))
    .sort((a, b) =>
      (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''),
    )
}

export async function markMatchNotificationsAsRead(
  supabase: SupabaseServerClient,
  userId: string,
  matchKey: string,
) {
  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select('id, data')
    .eq('user_id', userId)
    .eq('type', 'match_found')
    .eq('read', false)

  if (notificationsError) {
    throw notificationsError
  }

  const notificationIds = (notifications ?? [])
    .filter((notification) => {
      const data = notification.data

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false
      }

      return 'match_key' in data && data.match_key === matchKey
    })
    .map((notification) => notification.id)

  if (notificationIds.length === 0) {
    return
  }

  const { error: updateError } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', notificationIds)

  if (updateError) {
    throw updateError
  }
}
