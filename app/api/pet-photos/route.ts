import { getAuthorizedUser } from '@/lib/server-auth'
import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_FILES = 5

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const files = formData
      .getAll('photos')
      .filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'Файлы не выбраны' }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Можно загрузить не более ${MAX_FILES} фотографий` },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServer()
    const uploadedUrls: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Допускаются только изображения' },
          { status: 400 },
        )
      }

      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const fileName = `${auth.userId}/${crypto.randomUUID()}.${extension}`
      const arrayBuffer = await file.arrayBuffer()

      const { error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, arrayBuffer, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        throw new Error(`Ошибка загрузки фото: ${error.message}`)
      }

      const { data } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Не удалось загрузить фото',
      },
      { status: 500 },
    )
  }
}
