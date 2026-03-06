import { supabase } from '@/lib/supabase'
import type { NextAuthOptions, Session } from 'next-auth'
import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

type CredentialsInput = {
  email: string
  password: string
  phone?: string
  mode?: 'login' | 'register'
  name?: string
}

type ExtendedJwt = JWT & {
  id?: string
  phone?: string | null
}

type SessionUserWithMeta = Session['user'] & {
  id?: string
  phone?: string | null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        phone: { label: 'Phone', type: 'tel' },
        mode: { label: 'Mode', type: 'text' }, // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const { email, password, phone, mode, name } =
          credentials as CredentialsInput

        if (mode === 'register') {
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name: name || email.split('@')[0],
                  phone,
                },
              },
            })

          if (signUpError) {
            throw new Error(`Registration failed: ${signUpError.message}`)
          }

          const authUser = signUpData.user
          if (!authUser?.id) {
            throw new Error('Registration failed: empty user id')
          }

          const { data: newUser, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              email,
              phone,
              name: name || email.split('@')[0],
            })
            .select()
            .single()

          if (profileError) {
            throw new Error(`Profile save failed: ${profileError.message}`)
          }

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
          }
        }

        // Логика входа
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (signInError || !signInData.user) {
          throw new Error('Invalid email or password')
        }

        const { data: user, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single()

        if (error || !user) {
          throw new Error('Profile not found')
        }
        return {
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
        extToken.id = user.id
        extToken.phone = (user as SessionUserWithMeta).phone ?? null
      }
      return extToken
    },
    async session({ session, token }) {
      const extToken = token as ExtendedJwt
      const sessionUser = session.user as SessionUserWithMeta
      if (session.user) {
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
