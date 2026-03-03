export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          pet_id: string | null
          read: boolean | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          pet_id?: string | null
          read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          pet_id?: string | null
          read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'messages_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      pets: {
        Row: {
          breed: string | null
          color: string
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          date: string
          description: string | null
          district: string
          id: string
          name: string | null
          photos: string[] | null
          reward: number | null
          size: Database['public']['Enums']['pet_size']
          status: Database['public']['Enums']['pet_status']
          type: Database['public']['Enums']['pet_type']
          updated_at: string | null
          user_id: string
        }
        Insert: {
          breed?: string | null
          color: string
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          date: string
          description?: string | null
          district: string
          id?: string
          name?: string | null
          photos?: string[] | null
          reward?: number | null
          size: Database['public']['Enums']['pet_size']
          status: Database['public']['Enums']['pet_status']
          type: Database['public']['Enums']['pet_type']
          updated_at?: string | null
          user_id: string
        }
        Update: {
          breed?: string | null
          color?: string
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          date?: string
          description?: string | null
          district?: string
          id?: string
          name?: string | null
          photos?: string[] | null
          reward?: number | null
          size?: Database['public']['Enums']['pet_size']
          status?: Database['public']['Enums']['pet_status']
          type?: Database['public']['Enums']['pet_type']
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          active: boolean | null
          created_at: string | null
          districts: string[] | null
          id: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          districts?: string[] | null
          id?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          districts?: string[] | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'volunteers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pet_size: 'small' | 'medium' | 'large'
      pet_status: 'lost' | 'found'
      pet_type: 'dog' | 'cat' | 'small'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
