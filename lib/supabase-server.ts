import 'server-only'
import type { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'

type ServerEnvKey = 'NEXT_PUBLIC_SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY'

const getServerEnvValue = (key: ServerEnvKey) =>
  process.env[key]?.trim() || null

export const getSupabaseServerEnvError = () => {
  const missingKeys = (
    ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const
  ).filter((key) => !getServerEnvValue(key))

  if (missingKeys.length === 0) {
    return null
  }

  return `Missing required environment variable: ${missingKeys[0]}`
}

export const getSupabaseServer = () => {
  const envError = getSupabaseServerEnvError()
  if (envError) {
    throw new Error(envError)
  }

  return createClient<Database>(
    getServerEnvValue('NEXT_PUBLIC_SUPABASE_URL') as string,
    getServerEnvValue('SUPABASE_SERVICE_ROLE_KEY') as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
