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
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('pets')
        .insert(petData)
        .select()
        .single()

      if (error) throw error

      setPets((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Произошла ошибка при создании объявления')
    }
  }

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPets((prev) => prev.map((pet) => (pet.id === id ? data : pet)))
      return data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Произошла ошибка при обновлении объявления')
    }
  }

  const deletePet = async (id: string) => {
    try {
      const supabase = getSupabase()
      const { error } = await supabase.from('pets').delete().eq('id', id)

      if (error) throw error

      setPets((prev) => prev.filter((pet) => pet.id !== id))
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Произошла ошибка при удалении объявления')
    }
  }

  const uploadPetPhotos = async (files: File[], userId: string) => {
    const supabase = getSupabase()
    const uploadedUrls: string[] = []

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const fileName = `${userId}/${crypto.randomUUID()}.${extension}`

      const { error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
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

    return uploadedUrls
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
