import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const getRequiredEnv = (
  key: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Типы для базы данных (теперь используются из database.types.ts)
export type Pet = Database['public']['Tables']['pets']['Row']
export type PetInsert = Database['public']['Tables']['pets']['Insert']
export type AppUser = Database['public']['Tables']['profiles']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Volunteer = Database['public']['Tables']['volunteers']['Row']
