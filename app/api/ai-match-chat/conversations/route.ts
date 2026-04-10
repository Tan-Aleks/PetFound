import {
  ensureAiAssistantSummary,
  getAiMatchContextForUser,
  listAiMatchConversations,
} from '@/lib/ai-match-chat-server'
import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const supabase = getSupabaseServer()

    const { data: unreadNotifications, error: notificationsError } =
      await supabase
        .from('notifications')
        .select('data')
        .eq('user_id', auth.userId)
        .eq('type', 'match_found')

    if (notificationsError) {
      throw notificationsError
    }

    const unseenMatchKeys = new Set<string>()

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

      unseenMatchKeys.add(matchKey)
    }

    for (const matchKey of unseenMatchKeys) {
      const context = await getAiMatchContextForUser(supabase, auth.userId, {
        matchKey,
      })
      await ensureAiAssistantSummary(supabase, auth.userId, context)
    }

    const conversations = await listAiMatchConversations(supabase, auth.userId)

    return NextResponse.json({ conversations })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить AI-диалоги',
      },
      { status: 500 },
    )
  }
}
