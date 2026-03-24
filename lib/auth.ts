import 'server-only'
import type { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'
import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

type CredentialsInput = {
  district?: string
  email: string
  mode?: 'login' | 'register'
  name?: string
  password: string
  phone?: string
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
        mode: { label: 'Mode', type: 'text' },
        name: { label: 'Name', type: 'text' },
        district: { label: 'District', type: 'text' },
        password: { label: 'Password', type: 'password' },
        phone: { label: 'Phone', type: 'tel' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email и пароль обязательны')
        }

        const { district, email, password, phone, mode, name } =
          credentials as CredentialsInput

        if (mode === 'register') {
          const supabase = getSupabaseAuthClient()

          if (!phone?.trim()) {
            throw new Error('Телефон обязателен')
          }

          if (!district?.trim()) {
            throw new Error('Район проживания обязателен')
          }

          const { data: signUpData, error: signUpError } =
            await supabase.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: {
                district,
                name: name || email.split('@')[0],
                phone,
              },
            })

          if (signUpError) {
            throw new Error(`Ошибка регистрации: ${signUpError.message}`)
          }

          const authUser = signUpData.user
          if (!authUser?.id) {
            throw new Error(
              'Ошибка регистрации: пустой идентификатор пользователя',
            )
          }

          const { data: newUser, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              district,
              id: authUser.id,
              email,
              phone,
              name: name || email.split('@')[0],
            })
            .select()
            .single()

          if (profileError) {
            throw new Error(
              `Ошибка сохранения профиля: ${profileError.message}`,
            )
          }

          return {
            district: newUser.district,
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
          }
        }

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
          throw new Error('Профиль не найден')
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
