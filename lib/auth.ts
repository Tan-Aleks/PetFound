import 'server-only'
import type { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'
import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

type CredentialsInput = {
  email: string
  password: string
}

type ExtendedJwt = JWT & {
  district?: string | null
  id?: string
  phone?: string | null
}

type SessionUserWithMeta = Session['user'] & {
  district?: string | null
  id?: string
  phone?: string | null
}

const getSupabaseAuthClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email и пароль обязательны')
        }

        const { email, password } = credentials as CredentialsInput

        const supabase = getSupabaseAuthClient()
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (signInError || !signInData.user) {
          throw new Error('Неверный email или пароль')
        }

        const { data: user, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single()

        if (error || !user) {
          const userMetadata = signInData.user.user_metadata as {
            district?: string
            name?: string
            phone?: string
          } | null

          const fallbackProfile = {
            district: userMetadata?.district?.trim() || null,
            email: signInData.user.email || email,
            id: signInData.user.id,
            name:
              userMetadata?.name?.trim() ||
              signInData.user.email?.split('@')[0] ||
              email.split('@')[0],
            phone: userMetadata?.phone?.trim() || null,
          }

          const { data: restoredUser, error: restoreError } = await supabase
            .from('profiles')
            .upsert(fallbackProfile)
            .select()
            .single()

          if (restoreError || !restoredUser) {
            throw new Error('Профиль не найден')
          }

          return {
            district: restoredUser.district,
            id: restoredUser.id,
            email: restoredUser.email,
            name: restoredUser.name,
            phone: restoredUser.phone,
          }
        }

        return {
          district: user.district,
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const extToken = token as ExtendedJwt
      if (user) {
        extToken.district = (user as SessionUserWithMeta).district ?? null
        extToken.id = user.id
        extToken.phone = (user as SessionUserWithMeta).phone ?? null
      }
      return extToken
    },
    async session({ session, token }) {
      const extToken = token as ExtendedJwt
      const sessionUser = session.user as SessionUserWithMeta
      if (session.user) {
        sessionUser.district = extToken.district ?? null
        sessionUser.id = extToken.id
        sessionUser.phone = extToken.phone ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
