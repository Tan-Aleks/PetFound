import type { Pet, PetInsert } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'

interface UsePetsOptions {
  type?: 'dog' | 'cat' | 'small'
  status?: 'lost' | 'found'
  district?: string
  limit?: number
}

export function usePets(options: UsePetsOptions = {}) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()

      if (options.type) {
        params.set('type', options.type)
      }

      if (options.status) {
        params.set('status', options.status)
      }

      if (options.district) {
        params.set('district', options.district)
      }

      if (options.limit) {
        params.set('limit', String(options.limit))
      }

      const response = await fetch(`/api/pets?${params.toString()}`, {
        cache: 'no-store',
      })
      const payload = (await response.json()) as {
        error?: string
        pets?: Pet[]
      }

      if (!response.ok || !payload.pets) {
        throw new Error(payload.error || 'Произошла ошибка')
      }

      setPets(payload.pets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }, [options.district, options.limit, options.status, options.type])

  useEffect(() => {
    void fetchPets()
  }, [fetchPets])

  const createPet = async (petData: PetInsert) => {
    const response = await fetch('/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    })

    const payload = (await response.json()) as { error?: string; pet?: Pet }
    if (!response.ok || !payload.pet) {
      throw new Error(
        payload.error || 'Произошла ошибка при создании объявления',
      )
    }

    setPets((prev) => [payload.pet as Pet, ...prev])
    return payload.pet as Pet
  }

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    const response = await fetch(`/api/pets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const payload = (await response.json()) as { error?: string; pet?: Pet }
    if (!response.ok || !payload.pet) {
      throw new Error(
        payload.error || 'Произошла ошибка при обновлении объявления',
      )
    }

    setPets((prev) =>
      prev.map((pet) => (pet.id === id ? (payload.pet as Pet) : pet)),
    )
    return payload.pet as Pet
  }

  const deletePet = async (id: string) => {
    const response = await fetch(`/api/pets/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      throw new Error(
        payload.error || 'Произошла ошибка при удалении объявления',
      )
    }

    setPets((prev) => prev.filter((pet) => pet.id !== id))
  }

  const uploadPetPhotos = async (files: File[]) => {
    const formData = new FormData()
    for (const file of files) {
      formData.append('photos', file)
    }

    const response = await fetch('/api/pet-photos', {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as {
      error?: string
      urls?: string[]
    }
    if (!response.ok || !payload.urls) {
      throw new Error(payload.error || 'Произошла ошибка при загрузке фото')
    }

    return payload.urls
  }

  return {
    pets,
    loading,
    error,
    createPet,
    updatePet,
    deletePet,
    uploadPetPhotos,
    refetch: fetchPets,
  }
}

export function useSearchPets() {
  const [results, setResults] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPets = useCallback(
    async (searchParams: {
      query?: string
      type?: string
      district?: string
      status?: string
      dateFrom?: string
      dateTo?: string
    }) => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()

        if (searchParams.query?.trim()) {
          params.set('query', searchParams.query.trim())
        }

        if (searchParams.type?.trim()) {
          params.set('type', searchParams.type.trim())
        }

        if (searchParams.district?.trim()) {
          params.set('district', searchParams.district.trim())
        }

        if (searchParams.status?.trim()) {
          params.set('status', searchParams.status.trim())
        }

        if (searchParams.dateFrom?.trim()) {
          params.set('dateFrom', searchParams.dateFrom.trim())
        }

        if (searchParams.dateTo?.trim()) {
          params.set('dateTo', searchParams.dateTo.trim())
        }

        const response = await fetch(`/api/pets?${params.toString()}`, {
          cache: 'no-store',
        })
        const payload = (await response.json()) as {
          error?: string
          pets?: Pet[]
        }

        if (!response.ok || !payload.pets) {
          throw new Error(payload.error || 'Произошла ошибка при поиске')
        }

        setResults(payload.pets)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Произошла ошибка при поиске',
        )
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    results,
    loading,
    error,
    searchPets,
  }
}
