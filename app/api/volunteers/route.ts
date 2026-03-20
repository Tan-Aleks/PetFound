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
      .from('volunteers')
      .select('*')
      .eq('user_id', auth.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ volunteer: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить данные волонтера',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { districts } = await request.json()
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('volunteers')
      .upsert({
        user_id: auth.userId,
        districts: districts || [],
        active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ volunteer: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить данные волонтера',
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const supabase = getSupabaseServer()

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('user_id', auth.userId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось удалить данные волонтера',
      },
      { status: 500 },
    )
  }
}
