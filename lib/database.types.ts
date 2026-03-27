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
      cross_matches: {
        Row: {
          created_at: string | null
          external_pet_id: string
          id: string
          internal_pet_id: string
          match_type: Database['public']['Enums']['match_type']
          similarity_score: number
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          external_pet_id: string
          id?: string
          internal_pet_id: string
          match_type: Database['public']['Enums']['match_type']
          similarity_score: number
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          external_pet_id?: string | null
          id?: string
          internal_pet_id?: string | null
          match_type?: Database['public']['Enums']['match_type']
          similarity_score?: number
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'cross_matches_external_pet_id_fkey'
            columns: ['external_pet_id']
            isOneToOne: false
            referencedRelation: 'external_pets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cross_matches_internal_pet_id_fkey'
            columns: ['internal_pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
        ]
      }
      external_pets: {
        Row: {
          breed: string | null
          color: string
          contact_info: Json
          created_at: string | null
          date: string
          description: string
          district: string
          external_id: string
          id: string
          name: string | null
          photos: string[] | null
          size: Database['public']['Enums']['pet_size']
          source_id: string
          source_url: string
          status: Database['public']['Enums']['pet_status']
          type: Database['public']['Enums']['pet_type']
          updated_at: string | null
        }
        Insert: {
          breed?: string | null
          color: string
          contact_info: Json
          created_at?: string | null
          date: string
          description: string
          district: string
          external_id: string
          id?: string
          name?: string | null
          photos?: string[] | null
          size: Database['public']['Enums']['pet_size']
          source_id: string
          source_url: string
          status: Database['public']['Enums']['pet_status']
          type: Database['public']['Enums']['pet_type']
          updated_at?: string | null
        }
        Update: {
          breed?: string | null
          color?: string
          contact_info?: Json
          created_at?: string | null
          date?: string
          description?: string
          district?: string
          external_id?: string
          id?: string
          name?: string | null
          photos?: string[] | null
          size?: Database['public']['Enums']['pet_size']
          source_id?: string | null
          source_url?: string
          status?: Database['public']['Enums']['pet_status']
          type?: Database['public']['Enums']['pet_type']
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'external_pets_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'external_sources'
            referencedColumns: ['id']
          },
        ]
      }
      external_sources: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          last_parsed: string | null
          name: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          last_parsed?: string | null
          name: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          last_parsed?: string | null
          name?: string
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          pet_id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          pet_id: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
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
      notifications: {
        Row: {
          content: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          sent_email: boolean | null
          sent_sms: boolean | null
          title: string
          type: Database['public']['Enums']['notification_type']
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          title: string
          type: Database['public']['Enums']['notification_type']
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          title?: string
          type?: Database['public']['Enums']['notification_type']
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
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
          district: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_previews: {
        Args: {
          profile_ids: string[]
        }
        Returns: {
          email: string | null
          id: string
          name: string | null
        }[]
      }
    }
    Enums: {
      match_type: 'visual' | 'text' | 'combined'
      notification_type: 'match_found' | 'message_received'
      pet_size: 'small' | 'medium' | 'large'
      pet_status: 'lost' | 'found'
      pet_type: 'dog' | 'cat' | 'small'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
