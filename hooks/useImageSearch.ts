import type { Pet } from '@/lib/supabase'
import { useCallback, useState } from 'react'

interface SearchResult extends Pet {
  ai_similarity: number
}

export function useImageSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

      const payload = (await response.json()) as {
        error?: string
        results?: SearchResult[]
        total?: number
      }

      if (!response.ok || !payload.results) {
        throw new Error(payload.error || 'Ошибка при AI-поиске')
      }

      setResults(payload.results)
      return payload.results
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при AI-поиске'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setPreviewUrl(null)
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    previewUrl,
    searchByImage,
    clearResults,
  }
}
