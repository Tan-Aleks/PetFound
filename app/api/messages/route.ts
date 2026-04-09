import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type MessagePayload = {
  content?: string
  petId?: string
  receiverId?: string
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')?.trim()

    if (!petId) {
      return NextResponse.json(
        { error: 'Не указан идентификатор объявления' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('pet_id', petId)
      .or(`sender_id.eq.${auth.userId},receiver_id.eq.${auth.userId}`)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить сообщения',
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

    const payload = (await request.json()) as MessagePayload
    const content = payload.content?.trim() || ''

    if (!payload.petId || !payload.receiverId || !content) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля сообщения' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServer()
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id')
      .eq('id', payload.petId)
      .single()

    if (petError || !pet) {
      return NextResponse.json(
        { error: 'Объявление не найдено' },
        { status: 404 },
      )
    }

    if (payload.receiverId === auth.userId) {
      return NextResponse.json(
        { error: 'Нельзя отправить сообщение самому себе' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        pet_id: payload.petId,
        read: false,
        receiver_id: payload.receiverId,
        sender_id: auth.userId,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось отправить сообщение',
      },
      { status: 500 },
    )
  }
}
