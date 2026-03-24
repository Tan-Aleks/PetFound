import { getAuthorizedUser } from '@/lib/server-auth'
import type { PetInsert } from '@/lib/supabase'
import {
  getSupabasePublicServer,
  getSupabaseServer,
} from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = getSupabasePublicServer()
    let query = supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false })

    const type = searchParams.get('type')?.trim()
    const status = searchParams.get('status')?.trim()
    const district = searchParams.get('district')?.trim()
    const dateFrom = searchParams.get('dateFrom')?.trim()
    const dateTo = searchParams.get('dateTo')?.trim()
    const search = searchParams.get('query')?.trim()
    const limit = Number.parseInt(searchParams.get('limit') || '', 10)

    if (type) {
      query = query.eq('type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (district) {
      query = query.eq('district', district)
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,breed.ilike.%${search}%,description.ilike.%${search}%,color.ilike.%${search}%`,
      )
    }

    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ pets: data || [] })
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
