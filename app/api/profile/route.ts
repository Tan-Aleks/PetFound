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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.userId)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить профиль',
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const payload = await request.json()
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: payload.name?.trim() || null,
        phone: payload.phone?.trim() || null,
        district: payload.district?.trim() || null,
      })
      .eq('id', auth.userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось обновить профиль',
      },
      { status: 500 },
    )
  }
}
