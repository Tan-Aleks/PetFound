/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabasePublicServer } from '@/lib/supabase-server'
import { CLIPVisionModelWithProjection, RawImage } from '@xenova/transformers'
import { NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let visionModel: any = null

async function getVisionModel() {
  if (!visionModel) {
    visionModel = await CLIPVisionModelWithProjection.from_pretrained(
      'Xenova/clip-vit-base-patch16',
      {
        progress_callback: () => {},
      },
    )
  }
  return visionModel
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (normA * normB)
}

async function getImageEmbedding(imageUrl: string): Promise<number[] | null> {
  try {
    const model = await getVisionModel()
    const image = await RawImage.fromURL(imageUrl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = (await model(image)) as any
    return Array.from(output.data as Iterable<number>)
  } catch (error) {
    console.error('Failed to get image embedding:', error)
    return null
  }
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Изображение не предоставлено' },
        { status: 400 },
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Неподдерживаемый формат изображения. Используйте JPEG, PNG или WebP.',
        },
        { status: 400 },
      )
    }

    const model = await getVisionModel()

    const arrayBuffer = await file.arrayBuffer()
    const imageBlob = new Blob([arrayBuffer], { type: file.type })
    const imageData = await RawImage.fromBlob(imageBlob)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryOutput = (await model(imageData)) as any
    const queryVector = Array.from(queryOutput.data as Iterable<number>)

    const supabase = getSupabasePublicServer()
    const { data: pets, error } = await supabase
      .from('pets')
      .select(
        'id, photos, name, type, breed, color, size, district, status, date, description, contact_name, contact_phone, reward',
      )
      .not('photos', 'is', null)

    if (error) {
      throw error
    }

    interface SearchResult {
      pet: (typeof pets)[0]
      similarity: number
    }
    const results: SearchResult[] = []

    for (const pet of pets ?? []) {
      const photos = pet.photos
      if (!photos || photos.length === 0) continue

      let maxSimilarity = 0
      for (const photoUrl of photos) {
        const petEmbedding = await getImageEmbedding(photoUrl)
        if (petEmbedding) {
          const similarity = cosineSimilarity(queryVector, petEmbedding)
          maxSimilarity = Math.max(maxSimilarity, similarity)
        }
      }

      if (maxSimilarity > 0.25) {
        results.push({ pet, similarity: maxSimilarity })
      }
    }

    results.sort((a, b) => b.similarity - a.similarity)

    return NextResponse.json({
      results: results.slice(0, 20).map((r) => ({
        ...r.pet,
        ai_similarity: Math.round(r.similarity * 100),
      })),
      total: results.length,
    })
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ошибка при AI-поиске',
      },
      { status: 500 },
    )
  }
}
