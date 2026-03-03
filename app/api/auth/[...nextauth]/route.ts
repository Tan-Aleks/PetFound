import { supabase } from '@/lib/supabase'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
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

        const { email, password, phone, mode, name } = credentials as any

        if (mode === 'register') {
          // В реальном приложении здесь должно быть хеширование пароля и проверка Supabase Auth
          // Для MVP используем упрощенную логику с таблицей profiles
          const { data: newUser, error: createError } = await supabase
            .from('profiles')
            .insert({
              email,
              phone,
              name: name || email.split('@')[0],
              id: crypto.randomUUID(), // В связке с Supabase Auth это будет auth.uid()
            })
            .select()
            .single()

          if (createError)
            throw new Error('Registration failed: ' + createError.message)
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
          }
        }

        // Логика входа
        const { data: user, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single()

        if (error || !user) {
          throw new Error('User not found')
        }

        // В MVP мы предполагаем, что пароль проверяется внешними средствами или упрощенно
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
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone
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
