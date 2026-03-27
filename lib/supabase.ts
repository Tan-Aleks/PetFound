import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type SupabaseEnvKey =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

const getEnvValue = (key: SupabaseEnvKey) => process.env[key]?.trim() || null

export const getSupabaseEnvError = () => {
  const missingKeys = (
    ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
  ).filter((key) => !getEnvValue(key))

  if (missingKeys.length === 0) {
    return null
  }

  return `Missing required environment variable: ${missingKeys[0]}`
}

export const isSupabaseConfigured = () => getSupabaseEnvError() === null

export const getSupabase = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const envError = getSupabaseEnvError()
  if (envError) {
    throw new Error(envError)
  }

  supabaseClient = createClient<Database>(
    getEnvValue('NEXT_PUBLIC_SUPABASE_URL') as string,
    getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY') as string,
  )

  return supabaseClient
}

// Типы для базы данных (теперь используются из database.types.ts)
export type Pet = Database['public']['Tables']['pets']['Row']
export type PetInsert = Database['public']['Tables']['pets']['Insert']
export type AppUser = Database['public']['Tables']['profiles']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
