import { useState, useEffect } from 'react'
import { supabase, type Pet } from '@/lib/supabase'

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

  useEffect(() => {
    fetchPets()
  }, [options])

  const fetchPets = async () => {
    try {
      setLoading(true)
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
  }

  const createPet = async (petData: Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Временная заглушка для создания питомца
      const mockUser = { id: 'temp-user-id' }
      
      const { data, error } = await supabase
        .from('pets')
        .insert([{ ...petData, user_id: mockUser.id }])
        .select()
        .single()

      if (error) throw error

      setPets(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при создании объявления')
    }
  }

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPets(prev => prev.map(pet => pet.id === id ? data : pet))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при обновлении объявления')
    }
  }

  const deletePet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPets(prev => prev.filter(pet => pet.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при удалении объявления')
    }
  }

  return {
    pets,
    loading,
    error,
    createPet,
    updatePet,
    deletePet,
    refetch: fetchPets
  }
}

export function useSearchPets() {
  const [results, setResults] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPets = async (searchParams: {
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
        query = query.or(`name.ilike.%${searchParams.query}%,breed.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,color.ilike.%${searchParams.query}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setResults(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при поиске')
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    searchPets
  }
}