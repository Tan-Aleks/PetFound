import type { Pet } from '@/lib/supabase'
import { useCallback, useState } from 'react'

interface InternalSearchResult extends Pet {
  ai_similarity: number
}

interface ExternalSearchResult {
  ai_similarity: number
  breed: string | null
  color: string
  contact_info: unknown
  date: string
  description: string
  district: string
  id: string
  name: string | null
  photos: string[] | null
  size: 'small' | 'medium' | 'large'
  source_home_url: string | null
  source_name: string | null
  source_url: string
  status: 'lost' | 'found'
  type: 'dog' | 'cat' | 'small'
}

interface ImageSearchResponse {
  error?: string
  externalResults?: ExternalSearchResult[]
  internalResults?: InternalSearchResult[]
  totals?: {
    combined: number
    external: number
    internal: number
  }
}

export function useImageSearch() {
  const [results, setResults] = useState<InternalSearchResult[]>([])
  const [externalResults, setExternalResults] = useState<
    ExternalSearchResult[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [totals, setTotals] = useState({
    combined: 0,
    external: 0,
    internal: 0,
  })

  const searchByImage = useCallback(async (file: File) => {
    try {
      setLoading(true)
      setError(null)

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/pets/search-by-image', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as ImageSearchResponse

      if (
        !response.ok ||
        !payload.internalResults ||
        !payload.externalResults ||
        !payload.totals
      ) {
        throw new Error(payload.error || 'Ошибка при AI-поиске')
      }

      setResults(payload.internalResults)
      setExternalResults(payload.externalResults)
      setTotals(payload.totals)

      return {
        externalResults: payload.externalResults,
        internalResults: payload.internalResults,
        totals: payload.totals,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при AI-поиске'
      setError(message)
      setResults([])
      setExternalResults([])
      setTotals({ combined: 0, external: 0, internal: 0 })

      return {
        externalResults: [],
        internalResults: [],
        totals: { combined: 0, external: 0, internal: 0 },
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setExternalResults([])
    setPreviewUrl(null)
    setError(null)
    setTotals({ combined: 0, external: 0, internal: 0 })
  }, [])

  return {
    results,
    externalResults,
    loading,
    error,
    previewUrl,
    searchByImage,
    clearResults,
    totals,
  }
}
