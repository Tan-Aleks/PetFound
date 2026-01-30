import { createClient } from '@supabase/supabase-js'

// Временные значения для разработки - замените на реальные при настройке Supabase
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface Pet {
  id: string
  name: string | null
  type: 'dog' | 'cat' | 'small'
  breed: string | null
  color: string
  size: 'small' | 'medium' | 'large'
  district: string
  date: string
  status: 'lost' | 'found'
  description: string
  contact_name: string
  contact_phone: string
  contact_email: string | null
  reward: number | null
  photos: string[]
  created_at: string
  updated_at: string
  user_id: string
}

export interface AppUser {
  id: string
  email: string
  name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  pet_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export interface Volunteer {
  id: string
  user_id: string
  districts: string[]
  active: boolean
  created_at: string
}