import { type Pet, type PetInsert, getSupabase } from '@/lib/supabase'
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
      const supabase = getSupabase()
      let query = supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.district) {
        query = query.eq('district', options.district)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error

      setPets(data || [])
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
        const supabase = getSupabase()
        let query = supabase
          .from('pets')
          .select('*')
          .order('created_at', { ascending: false })

        if (searchParams.type && searchParams.type !== '') {
          query = query.eq('type', searchParams.type)
        }

        if (searchParams.district && searchParams.district !== '') {
          query = query.eq('district', searchParams.district)
        }

        if (searchParams.status && searchParams.status !== '') {
          query = query.eq('status', searchParams.status)
        }

        if (searchParams.dateFrom) {
          query = query.gte('date', searchParams.dateFrom)
        }

        if (searchParams.dateTo) {
          query = query.lte('date', searchParams.dateTo)
        }

        if (searchParams.query && searchParams.query.trim() !== '') {
          query = query.or(
            `name.ilike.%${searchParams.query}%,breed.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,color.ilike.%${searchParams.query}%`,
          )
        }

        const { data, error } = await query

        if (error) throw error

        setResults(data || [])
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
