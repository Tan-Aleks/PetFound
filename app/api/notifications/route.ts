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

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    const unreadCount = data?.filter((n) => !n.read).length || 0

    return NextResponse.json({ notifications: data || [], unreadCount })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить уведомления',
      },
      { status: 500 },
    )
  }
}
