import type { Database } from '@/lib/database.types'
import { getSupabaseServer } from '@/lib/supabase-server'
import { CLIPVisionModelWithProjection, RawImage } from '@xenova/transformers'
import { NextResponse } from 'next/server'

type VisionModel = Awaited<
  ReturnType<typeof CLIPVisionModelWithProjection.from_pretrained>
>

type ModelOutput = {
  data: Iterable<number>
}

type InternalPet = Pick<
  Database['public']['Tables']['pets']['Row'],
  | 'id'
  | 'user_id'
  | 'photos'
  | 'name'
  | 'type'
  | 'breed'
  | 'color'
  | 'size'
  | 'district'
  | 'status'
  | 'date'
  | 'description'
  | 'contact_name'
  | 'contact_phone'
  | 'reward'
>
type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert']
type ExternalPet = Database['public']['Tables']['external_pets']['Row']
type ExternalSource = Database['public']['Tables']['external_sources']['Row']
type CrossMatchInsert = Database['public']['Tables']['cross_matches']['Insert']

type SearchResult<T> = {
  item: T
  similarity: number
}

const AI_SIMILARITY_THRESHOLD = 0.25
const RESULT_LIMIT = 20

let visionModel: VisionModel | null = null

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
    const aValue = a[i] ?? 0
    const bValue = b[i] ?? 0

    dotProduct += aValue * bValue
    normA += aValue * aValue
    normB += bValue * bValue
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (normA * normB)
}

function extractEmbedding(output: unknown): number[] {
  if (
    typeof output === 'object' &&
    output !== null &&
    'data' in output &&
    output.data &&
    Symbol.iterator in Object(output.data)
  ) {
    return Array.from((output as ModelOutput).data)
  }

  throw new Error('Не удалось получить эмбеддинг изображения')
}

async function getImageEmbedding(
  imageUrl: string,
  cache?: Map<string, number[] | null>,
): Promise<number[] | null> {
  const cachedEmbedding = cache?.get(imageUrl)
  if (cachedEmbedding !== undefined) {
    return cachedEmbedding
  }

  try {
    const model = await getVisionModel()
    const image = await RawImage.fromURL(imageUrl)
    const output = await model(image)
    const embedding = extractEmbedding(output)
    cache?.set(imageUrl, embedding)
    return embedding
  } catch (error) {
    console.error('Failed to get image embedding:', error)
    cache?.set(imageUrl, null)
    return null
  }
}

async function getMaxSimilarity(
  queryVector: number[],
  photos: string[] | null,
  cache?: Map<string, number[] | null>,
): Promise<number> {
  if (!photos?.length) {
    return 0
  }

  let maxSimilarity = 0

  for (const photoUrl of photos) {
    const petEmbedding = await getImageEmbedding(photoUrl, cache)

    if (!petEmbedding) {
      continue
    }

    const similarity = cosineSimilarity(queryVector, petEmbedding)
    maxSimilarity = Math.max(maxSimilarity, similarity)
  }

  return maxSimilarity
}

async function getPairSimilarity(
  leftPhotos: string[] | null,
  rightPhotos: string[] | null,
  cache?: Map<string, number[] | null>,
): Promise<number> {
  if (!leftPhotos?.length || !rightPhotos?.length) {
    return 0
  }

  let maxSimilarity = 0

  for (const leftPhoto of leftPhotos) {
    const leftEmbedding = await getImageEmbedding(leftPhoto, cache)

    if (!leftEmbedding) {
      continue
    }

    for (const rightPhoto of rightPhotos) {
      const rightEmbedding = await getImageEmbedding(rightPhoto, cache)

      if (!rightEmbedding) {
        continue
      }

      const similarity = cosineSimilarity(leftEmbedding, rightEmbedding)
      maxSimilarity = Math.max(maxSimilarity, similarity)
    }
  }

  return maxSimilarity
}

async function collectVisualMatches<T extends { photos: string[] | null }>(
  items: T[],
  queryVector: number[],
  cache?: Map<string, number[] | null>,
): Promise<SearchResult<T>[]> {
  const results: SearchResult<T>[] = []

  for (const item of items) {
    const maxSimilarity = await getMaxSimilarity(
      queryVector,
      item.photos,
      cache,
    )

    if (maxSimilarity > AI_SIMILARITY_THRESHOLD) {
      results.push({ item, similarity: maxSimilarity })
    }
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, RESULT_LIMIT)
}

function getCrossMatchKey(internalPetId: string, externalPetId: string) {
  return `${internalPetId}:${externalPetId}`
}

function getNotificationKey(
  userId: string,
  internalPetId: string,
  externalPetId: string,
) {
  return `${userId}:${getCrossMatchKey(internalPetId, externalPetId)}`
}

function buildMatchNotification(
  internalPet: InternalPet,
  externalPet: ExternalPet,
  source: Pick<ExternalSource, 'id' | 'name' | 'url'> | undefined,
  similarityScore: number,
): NotificationInsert {
  const petName = internalPet.name || externalPet.name || 'вашего питомца'
  const externalStatusLabel =
    externalPet.status === 'found' ? 'найденном питомце' : 'пропавшем питомце'

  return {
    content: `AI нашел похожее объявление о ${externalStatusLabel} на ${source?.name || 'внешнем сайте'}. Проверьте совпадение для ${petName}.`,
    data: {
      external_pet_id: externalPet.id,
      external_source_name: source?.name ?? null,
      external_source_url: externalPet.source_url,
      internal_pet_id: internalPet.id,
      match_key: getCrossMatchKey(internalPet.id, externalPet.id),
      pet_name: petName,
      similarity_score: similarityScore,
      source_home_url: source?.url ?? null,
    },
    title: 'Найдено возможное совпадение',
    type: 'match_found',
    user_id: internalPet.user_id,
  }
}

async function syncMatchNotifications(
  supabase: ReturnType<typeof getSupabaseServer>,
  matchesToPersist: CrossMatchInsert[],
  internalResults: SearchResult<InternalPet>[],
  externalResults: SearchResult<ExternalPet>[],
  sourceById: Map<string, Pick<ExternalSource, 'id' | 'name' | 'url'>>,
) {
  if (matchesToPersist.length === 0) {
    return
  }

  const internalById = new Map(
    internalResults.map((result) => [result.item.id, result.item]),
  )
  const externalById = new Map(
    externalResults.map((result) => [result.item.id, result.item]),
  )
  const userIds = Array.from(
    new Set(
      matchesToPersist
        .map((match) => internalById.get(match.internal_pet_id)?.user_id)
        .filter((value): value is string => Boolean(value)),
    ),
  )

  if (userIds.length === 0) {
    return
  }

  const { data: existingNotifications, error: notificationsError } =
    await supabase
      .from('notifications')
      .select('id, user_id, data')
      .eq('type', 'match_found')
      .in('user_id', userIds)

  if (notificationsError) {
    throw notificationsError
  }

  const existingNotificationKeys = new Set(
    (existingNotifications ?? []).flatMap((notification) => {
      const data = notification.data

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return []
      }

      const internalPetId =
        'internal_pet_id' in data && typeof data.internal_pet_id === 'string'
          ? data.internal_pet_id
          : null
      const externalPetId =
        'external_pet_id' in data && typeof data.external_pet_id === 'string'
          ? data.external_pet_id
          : null

      if (!internalPetId || !externalPetId) {
        return []
      }

      return [
        getNotificationKey(notification.user_id, internalPetId, externalPetId),
      ]
    }),
  )

  const notificationsToInsert: NotificationInsert[] = []

  for (const match of matchesToPersist) {
    const internalPet = internalById.get(match.internal_pet_id)
    const externalPet = externalById.get(match.external_pet_id)

    if (!internalPet || !externalPet) {
      continue
    }

    const notificationKey = getNotificationKey(
      internalPet.user_id,
      internalPet.id,
      externalPet.id,
    )

    if (existingNotificationKeys.has(notificationKey)) {
      continue
    }

    notificationsToInsert.push(
      buildMatchNotification(
        internalPet,
        externalPet,
        sourceById.get(externalPet.source_id),
        match.similarity_score,
      ),
    )
    existingNotificationKeys.add(notificationKey)
  }

  if (notificationsToInsert.length === 0) {
    return
  }

  const { error: insertNotificationsError } = await supabase
    .from('notifications')
    .insert(notificationsToInsert)

  if (insertNotificationsError) {
    throw insertNotificationsError
  }
}

async function syncCrossMatches(
  supabase: ReturnType<typeof getSupabaseServer>,
  internalResults: SearchResult<InternalPet>[],
  externalResults: SearchResult<ExternalPet>[],
  sourceById: Map<string, Pick<ExternalSource, 'id' | 'name' | 'url'>>,
  cache?: Map<string, number[] | null>,
) {
  if (internalResults.length === 0 || externalResults.length === 0) {
    return
  }

  const candidateMatches = new Map<string, CrossMatchInsert>()

  for (const internalResult of internalResults) {
    for (const externalResult of externalResults) {
      if (internalResult.item.type !== externalResult.item.type) {
        continue
      }

      if (internalResult.item.status === externalResult.item.status) {
        continue
      }

      const similarity = await getPairSimilarity(
        internalResult.item.photos,
        externalResult.item.photos,
        cache,
      )

      if (similarity <= AI_SIMILARITY_THRESHOLD) {
        continue
      }

      const similarityScore = Number(similarity.toFixed(2))
      const key = getCrossMatchKey(
        internalResult.item.id,
        externalResult.item.id,
      )
      const existingCandidate = candidateMatches.get(key)

      if (
        !existingCandidate ||
        similarityScore > existingCandidate.similarity_score
      ) {
        candidateMatches.set(key, {
          external_pet_id: externalResult.item.id,
          internal_pet_id: internalResult.item.id,
          match_type: 'visual',
          similarity_score: similarityScore,
          verified: false,
        })
      }
    }
  }

  const matchesToPersist = Array.from(candidateMatches.values())

  if (matchesToPersist.length === 0) {
    return
  }

  const internalPetIds = Array.from(
    new Set(matchesToPersist.map((match) => match.internal_pet_id)),
  )
  const externalPetIds = Array.from(
    new Set(matchesToPersist.map((match) => match.external_pet_id)),
  )

  const { data: existingMatches, error: existingMatchesError } = await supabase
    .from('cross_matches')
    .select('id, internal_pet_id, external_pet_id, similarity_score')
    .in('internal_pet_id', internalPetIds)
    .in('external_pet_id', externalPetIds)

  if (existingMatchesError) {
    throw existingMatchesError
  }

  const existingMatchesByKey = new Map(
    (existingMatches ?? []).map((match) => [
      getCrossMatchKey(match.internal_pet_id, match.external_pet_id),
      match,
    ]),
  )

  const matchesToInsert: CrossMatchInsert[] = []
  const matchesToUpdate = [] as {
    id: string
    similarity_score: number
  }[]

  for (const match of matchesToPersist) {
    const existingMatch = existingMatchesByKey.get(
      getCrossMatchKey(match.internal_pet_id, match.external_pet_id),
    )

    if (!existingMatch) {
      matchesToInsert.push(match)
      continue
    }

    if (Number(existingMatch.similarity_score) !== match.similarity_score) {
      matchesToUpdate.push({
        id: existingMatch.id,
        similarity_score: match.similarity_score,
      })
    }
  }

  if (matchesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('cross_matches')
      .insert(matchesToInsert)

    if (insertError) {
      throw insertError
    }
  }

  if (matchesToUpdate.length > 0) {
    await Promise.all(
      matchesToUpdate.map(async (match) => {
        const { error: updateError } = await supabase
          .from('cross_matches')
          .update({ similarity_score: match.similarity_score })
          .eq('id', match.id)

        if (updateError) {
          throw updateError
        }
      }),
    )
  }

  await syncMatchNotifications(
    supabase,
    matchesToPersist,
    internalResults,
    externalResults,
    sourceById,
  )
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
    const queryOutput = await model(imageData)
    const queryVector = extractEmbedding(queryOutput)
    const imageEmbeddingCache = new Map<string, number[] | null>()

    const supabase = getSupabaseServer()
    const [petsResponse, externalPetsResponse, sourcesResponse] =
      await Promise.all([
        supabase
          .from('pets')
          .select(
            'id, user_id, photos, name, type, breed, color, size, district, status, date, description, contact_name, contact_phone, reward',
          )
          .not('photos', 'is', null),
        supabase.from('external_pets').select('*').not('photos', 'is', null),
        supabase
          .from('external_sources')
          .select('id, name, url')
          .eq('active', true),
      ])

    if (petsResponse.error) {
      throw petsResponse.error
    }

    if (externalPetsResponse.error) {
      throw externalPetsResponse.error
    }

    if (sourcesResponse.error) {
      throw sourcesResponse.error
    }

    const pets = (petsResponse.data ?? []) as InternalPet[]
    const externalPets = (externalPetsResponse.data ?? []) as ExternalPet[]
    const sources = (sourcesResponse.data ?? []) as Pick<
      ExternalSource,
      'id' | 'name' | 'url'
    >[]

    const [internalResults, externalResults] = await Promise.all([
      collectVisualMatches(pets, queryVector, imageEmbeddingCache),
      collectVisualMatches(externalPets, queryVector, imageEmbeddingCache),
    ])

    const sourceById = new Map(sources.map((source) => [source.id, source]))

    try {
      await syncCrossMatches(
        supabase,
        internalResults,
        externalResults,
        sourceById,
        imageEmbeddingCache,
      )
    } catch (crossMatchError) {
      console.error('Failed to sync cross matches:', crossMatchError)
    }

    return NextResponse.json({
      internalResults: internalResults.map((result) => ({
        breed: result.item.breed,
        ai_similarity: Math.round(result.similarity * 100),
        color: result.item.color,
        contact_name: result.item.contact_name,
        contact_phone: result.item.contact_phone,
        date: result.item.date,
        description: result.item.description,
        district: result.item.district,
        id: result.item.id,
        name: result.item.name,
        photos: result.item.photos,
        reward: result.item.reward,
        size: result.item.size,
        status: result.item.status,
        type: result.item.type,
      })),
      externalResults: externalResults.map((result) => {
        const source = sourceById.get(result.item.source_id)

        return {
          ...result.item,
          ai_similarity: Math.round(result.similarity * 100),
          source_name: source?.name ?? null,
          source_home_url: source?.url ?? null,
        }
      }),
      totals: {
        internal: internalResults.length,
        external: externalResults.length,
        combined: internalResults.length + externalResults.length,
      },
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
