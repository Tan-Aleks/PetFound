import { parseCrossMatchKey } from '@/lib/ai-match-chat'
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

type AiMatchMessage = Database['public']['Tables']['ai_match_messages']['Row']

export async function GET(
  _request: Request,
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
    const supabase = getSupabaseServer()
    const context = await getAiMatchContextForUser(
      supabase,
      auth.userId,
      parseCrossMatchKey(matchId) ? { matchKey: matchId } : { matchId },
    )

    await ensureAiAssistantSummary(supabase, auth.userId, context)
    await markMatchNotificationsAsRead(supabase, auth.userId, context.matchKey)

    const { data: messages, error: messagesError } = await supabase
      .from('ai_match_messages')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('match_id', context.matchId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw messagesError
    }

    return NextResponse.json({
      context,
      messages: (messages ?? []) as AiMatchMessage[],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить AI-чат',
      },
      { status: 500 },
    )
  }
}
