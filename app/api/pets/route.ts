import { getAuthorizedUser } from '@/lib/server-auth'
import type { PetInsert } from '@/lib/supabase'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const payload = (await request.json()) as Partial<PetInsert>
    const supabase = getSupabaseServer()

    const petPayload: PetInsert = {
      user_id: auth.userId,
      color: payload.color?.trim() || '',
      contact_name: payload.contact_name?.trim() || '',
      contact_phone: payload.contact_phone?.trim() || '',
      date: payload.date || '',
      district: payload.district?.trim() || '',
      size: payload.size as PetInsert['size'],
      status: payload.status as PetInsert['status'],
      type: payload.type as PetInsert['type'],
      breed: payload.breed?.trim() || null,
      contact_email: payload.contact_email?.trim() || null,
      description: payload.description?.trim() || null,
      name: payload.name?.trim() || null,
      photos: payload.photos || [],
      reward: payload.reward ?? null,
    }

    if (
      !petPayload.color ||
      !petPayload.contact_name ||
      !petPayload.contact_phone ||
      !petPayload.date ||
      !petPayload.district ||
      !petPayload.size ||
      !petPayload.status ||
      !petPayload.type
    ) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля объявления' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('pets')
      .insert(petPayload)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ pet: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось создать объявление',
      },
      { status: 500 },
    )
  }
}
