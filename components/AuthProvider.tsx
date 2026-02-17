'use client'

import { supabase } from '@/lib/supabase'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email?: string
  user_metadata?: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Получаем текущего пользователя
    const getUser = async () => {
      try {
        // Временная заглушка для разработки
        setUser(null)
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Временная заглушка для слушателя изменений
    const unsubscribe = () => {}

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Временная заглушка для входа
      console.log('Sign in:', email, password)
      throw new Error('Аутентификация временно недоступна')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // Временная заглушка для регистрации
      console.log('Sign up:', email, password, userData)
      throw new Error('Регистрация временно недоступна')
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Временная заглушка для выхода
      setUser(null)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
