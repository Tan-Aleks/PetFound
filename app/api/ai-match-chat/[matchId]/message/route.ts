import {
  type AiMatchContext,
  buildAiResponse,
  detectAiTopic,
  parseCrossMatchKey,
} from '@/lib/ai-match-chat'
import {
  ensureAiAssistantSummary,
  getAiMatchContextForUser,
  markMatchNotificationsAsRead,
} from '@/lib/ai-match-chat-server'
import type { Database } from '@/lib/database.types'
import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type AiTopic = Database['public']['Enums']['ai_chat_topic']

type MessagePayload = {
  content?: string
}

function buildAssistantMessage(context: AiMatchContext, question: string) {
  const topic = detectAiTopic(question) as AiTopic

  return {
    content: buildAiResponse(topic, context, question),
    topic,
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { matchId } = await params
    const payload = (await request.json()) as MessagePayload
    const content = payload.content?.trim() || ''

    if (!content) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServer()
    const context = await getAiMatchContextForUser(
      supabase,
      auth.userId,
      parseCrossMatchKey(matchId) ? { matchKey: matchId } : { matchId },
    )

    await ensureAiAssistantSummary(supabase, auth.userId, context)
    await markMatchNotificationsAsRead(supabase, auth.userId, context.matchKey)

    const assistantMessage = buildAssistantMessage(context, content)

    const { data: insertedMessages, error: insertError } = await supabase
      .from('ai_match_messages')
      .insert([
        {
          content,
          match_id: context.matchId,
          role: 'user',
          topic: null,
          user_id: auth.userId,
        },
        {
          content: assistantMessage.content,
          match_id: context.matchId,
          role: 'assistant',
          topic: assistantMessage.topic,
          user_id: auth.userId,
        },
      ])
      .select('*')
      .order('created_at', { ascending: true })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(
      { messages: insertedMessages ?? [] },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось отправить сообщение AI',
      },
      { status: 500 },
    )
  }
}
