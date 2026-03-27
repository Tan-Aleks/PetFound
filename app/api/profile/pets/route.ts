import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabasePublicServer } from '@/lib/supabase-server'
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

    const supabase = getSupabasePublicServer()

    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ pets: pets || [] })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить объявления',
      },
      { status: 500 },
    )
  }
}
