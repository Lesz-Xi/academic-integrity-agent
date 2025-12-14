export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          theme: string | null
          disclaimer_accepted: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          theme?: string | null
          disclaimer_accepted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          theme?: string | null
          disclaimer_accepted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      generations: {
        Row: {
          id: string
          user_id: string
          mode: string
          input: string
          output: string
          metrics: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode: string
          input: string
          output: string
          metrics: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: string
          input?: string
          output?: string
          metrics?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'generations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      saved_files: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          content: string | null
          character_count: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          content?: string | null
          character_count?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: string
          content?: string | null
          character_count?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_files_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
