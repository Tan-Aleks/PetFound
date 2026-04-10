import type { Database, Json } from '@/lib/database.types'

type AiChatTopic = Database['public']['Enums']['ai_chat_topic']

type InternalPetSummary = Pick<
  Database['public']['Tables']['pets']['Row'],
  'date' | 'district' | 'name' | 'status' | 'type'
>

type ExternalPetSummary = Pick<
  Database['public']['Tables']['external_pets']['Row'],
  | 'breed'
  | 'color'
  | 'contact_info'
  | 'date'
  | 'description'
  | 'district'
  | 'name'
  | 'size'
  | 'source_url'
  | 'status'
  | 'type'
>

type ExternalSourceSummary = Pick<
  Database['public']['Tables']['external_sources']['Row'],
  'name' | 'url'
>

export type AiMatchContext = {
  externalPet: ExternalPetSummary
  internalPet: InternalPetSummary
  matchId: string
  matchKey: string
  similarityScore: number
  source: ExternalSourceSummary | null
}

export type AiMatchIdentifier =
  | {
      matchId: string
      matchKey?: never
    }
  | {
      matchId?: never
      matchKey: string
    }

const TOPIC_KEYWORDS: Record<AiChatTopic, string[]> = {
  blocked: [],
  contacts: [
    'контакт',
    'связ',
    'телефон',
    'номер',
    'почт',
    'email',
    'e-mail',
    'whatsapp',
    'telegram',
    'tg',
  ],
  location: [
    'где',
    'район',
    'адрес',
    'место',
    'локац',
    'располож',
    'приют',
    'наход',
  ],
  pet: [
    'питом',
    'животн',
    'порода',
    'окрас',
    'размер',
    'клич',
    'описан',
    'статус',
    'дата',
    'фото',
  ],
  source: [
    'сайт',
    'источник',
    'площадк',
    'ссылка',
    'url',
    'объявлен',
    'источнике',
  ],
  summary: [
    'что известно',
    'кратко',
    'сводк',
    'итог',
    'совпаден',
    'найден',
    'расскажи',
  ],
}

const BLOCKED_PATTERNS = [
  'напиши код',
  'сделай',
  'задач',
  'найди в интернете',
  'проанализируй проект',
  'переведи',
  'сочини',
  'реши',
  'спланируй',
]

export const AI_MATCH_SUGGESTIONS = [
  'Что известно о питомце?',
  'На каком сайте найдено объявление?',
  'Какие контакты указаны?',
  'Где находится животное или приют?',
  'Дай короткую сводку по совпадению',
]

export function getCrossMatchKey(internalPetId: string, externalPetId: string) {
  return `${internalPetId}:${externalPetId}`
}

export function parseCrossMatchKey(matchKey: string) {
  const [internalPetId, externalPetId, ...rest] = matchKey.split(':')

  if (!internalPetId || !externalPetId || rest.length > 0) {
    return null
  }

  return { externalPetId, internalPetId }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function toTitleCasePetType(type: InternalPetSummary['type']) {
  switch (type) {
    case 'dog':
      return 'собака'
    case 'cat':
      return 'кошка'
    case 'small':
      return 'небольшое домашнее животное'
    default:
      return 'питомец'
  }
}

function toStatusLabel(status: InternalPetSummary['status']) {
  return status === 'lost' ? 'пропал' : 'найден'
}

function toSimilarityLabel(similarityScore: number) {
  return `${Math.round(similarityScore * 100)}%`
}

function stringifyJsonValue(value: Json): string[] {
  if (value === null) {
    return []
  }

  if (typeof value === 'string') {
    const normalized = normalizeWhitespace(value)
    return normalized ? [normalized] : []
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => stringifyJsonValue(item))
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    if (nestedValue === undefined || nestedValue === null) {
      return []
    }

    const nestedText = stringifyJsonValue(nestedValue)
    if (nestedText.length === 0) {
      return []
    }

    return nestedText.map((text) => `${key}: ${text}`)
  })
}

export function extractContactLines(contactInfo: Json) {
  return Array.from(new Set(stringifyJsonValue(contactInfo))).slice(0, 8)
}

export function extractLocationHints(contactInfo: Json) {
  const lines = extractContactLines(contactInfo)
  const locationKeywords = [
    'адрес',
    'район',
    'локац',
    'место',
    'приют',
    'метро',
    'город',
  ]

  return lines.filter((line) =>
    locationKeywords.some((keyword) => line.toLowerCase().includes(keyword)),
  )
}

export function detectAiTopic(input: string): AiChatTopic {
  const normalized = normalizeWhitespace(input.toLowerCase())

  if (!normalized) {
    return 'blocked'
  }

  if (BLOCKED_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return 'blocked'
  }

  let winner: AiChatTopic = 'blocked'
  let winnerScore = 0

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as Array<
    [AiChatTopic, string[]]
  >) {
    const score = keywords.reduce(
      (total, keyword) => total + Number(normalized.includes(keyword)),
      0,
    )

    if (score > winnerScore) {
      winner = topic
      winnerScore = score
    }
  }

  return winnerScore > 0 ? winner : 'blocked'
}

export function buildAiSummary(context: AiMatchContext) {
  const petName =
    context.internalPet.name || context.externalPet.name || 'питомец'
  const sourceName = context.source?.name || 'внешний сайт'

  return [
    `Я нашел возможное совпадение для объявления «${petName}».`,
    `Сходство по фото: ${toSimilarityLabel(context.similarityScore)}.`,
    `Источник: ${sourceName}.`,
    `Статус внешнего объявления: ${toStatusLabel(context.externalPet.status)}.`,
    `Район: ${context.externalPet.district}.`,
    'Я могу подсказать только данные по этому совпадению: сайт, ссылку, локацию, контакты и сведения о питомце.',
  ].join(' ')
}

export function buildAiResponse(
  topic: AiChatTopic,
  context: AiMatchContext,
  userQuestion: string,
) {
  const sourceName = context.source?.name || 'внешний сайт'
  const sourceUrl = context.source?.url || context.externalPet.source_url
  const petName =
    context.externalPet.name || context.internalPet.name || 'Без имени'
  const petType = toTitleCasePetType(context.externalPet.type)
  const contactLines = extractContactLines(context.externalPet.contact_info)
  const locationLines = extractLocationHints(context.externalPet.contact_info)

  switch (topic) {
    case 'summary':
      return buildAiSummary(context)
    case 'source':
      return [
        `Совпадение найдено на источнике: ${sourceName}.`,
        `Сайт источника: ${sourceUrl}.`,
        `Прямая ссылка на внешнее объявление: ${context.externalPet.source_url}.`,
      ].join(' ')
    case 'contacts':
      return contactLines.length > 0
        ? [
            `Во внешнем объявлении указаны такие контакты или способы связи: ${contactLines.join('; ')}.`,
            `Если нужно, откройте оригинальное объявление: ${context.externalPet.source_url}.`,
          ].join(' ')
        : [
            'Во внешнем объявлении нет структурированных контактов в сохраненных данных.',
            `Попробуйте открыть оригинальную ссылку: ${context.externalPet.source_url}.`,
          ].join(' ')
    case 'location':
      return [
        `Основная локация из внешнего объявления: ${context.externalPet.district}.`,
        locationLines.length > 0
          ? `Дополнительные подсказки по месту: ${locationLines.join('; ')}.`
          : 'Дополнительных подтвержденных данных о точном адресе в сохраненных полях нет.',
      ].join(' ')
    case 'pet':
      return [
        `По внешнему объявлению: ${petName} — ${petType}.`,
        context.externalPet.breed
          ? `Порода: ${context.externalPet.breed}.`
          : 'Порода не указана.',
        `Окрас: ${context.externalPet.color}.`,
        `Размер: ${context.externalPet.size}.`,
        `Статус: ${toStatusLabel(context.externalPet.status)}.`,
        `Дата публикации/события: ${new Date(context.externalPet.date).toLocaleDateString('ru-RU')}.`,
        `Описание: ${context.externalPet.description}.`,
      ].join(' ')
    default:
      return [
        `Я не выполняю произвольные задачи по запросу «${userQuestion.trim()}».`,
        'Я могу отвечать только по этому совпадению: сайт, ссылка, локация, контакты и сведения о питомце.',
      ].join(' ')
  }
}
