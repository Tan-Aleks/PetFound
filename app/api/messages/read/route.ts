import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabasePublicServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type ReadPayload = {
  messageIds?: string[]
  petId?: string
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

    const payload = (await request.json()) as ReadPayload
    const messageIds = Array.from(
      new Set((payload.messageIds || []).filter((value) => value.length > 0)),
    )

    if (!payload.petId || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Нет сообщений для отметки прочитанными' },
        { status: 400 },
      )
    }

    const supabase = getSupabasePublicServer()
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('pet_id', payload.petId)
      .eq('receiver_id', auth.userId)
      .in('id', messageIds)

    if (error) {
      throw error
    }

    return NextResponse.json({ updatedIds: messageIds })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось обновить статус сообщений',
      },
      { status: 500 },
    )
  }
}
