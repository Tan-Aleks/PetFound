import { getAuthorizedUser } from '@/lib/server-auth'
import type { Pet } from '@/lib/supabase'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Объявление не найдено' },
        { status: 404 },
      )
    }

    return NextResponse.json({ pet: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить объявление',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { id } = await context.params
    const updates = (await request.json()) as Partial<Pet>
    const supabase = getSupabaseServer()

    const { data: existing, error: existingError } = await supabase
      .from('pets')
      .select('id,user_id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Объявление не найдено' },
        { status: 404 },
      )
    }

    if (existing.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('pets')
      .update({
        ...updates,
        user_id: existing.user_id,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ pet: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось обновить объявление',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { id } = await context.params
    const supabase = getSupabaseServer()

    const { data: existing, error: existingError } = await supabase
      .from('pets')
      .select('id,user_id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Объявление не найдено' },
        { status: 404 },
      )
    }

    if (existing.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { error } = await supabase.from('pets').delete().eq('id', id)
    if (error) {
      throw error
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось удалить объявление',
      },
      { status: 500 },
    )
  }
}
