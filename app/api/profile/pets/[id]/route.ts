import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { id } = await params
    const supabase = getSupabaseServer()

    const { error: fetchError } = await supabase
      .from('pets')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Объявление не найдено' },
        { status: 404 },
      )
    }

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id)
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
            : 'Не удалось удалить объявление',
      },
      { status: 500 },
    )
  }
}
