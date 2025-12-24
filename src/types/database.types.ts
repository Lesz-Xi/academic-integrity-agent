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
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          mode: string
          input: string
          output: string
          metrics: Json
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          mode?: string
          input?: string
          output?: string
          metrics?: Json
          created_at?: string
          deleted_at?: string | null
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
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'premium'
          billing_cycle: 'monthly' | 'quarterly' | 'annual' | null
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          paypal_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'premium'
          billing_cycle?: 'monthly' | 'quarterly' | 'annual' | null
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          paypal_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'premium'
          billing_cycle?: 'monthly' | 'quarterly' | 'annual' | null
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          paypal_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      },
      drafts: {
        Row: {
          id: string
          user_id: string
          title: string
          current_content: string
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          current_content: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          current_content?: string
          last_updated?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'drafts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      },
      draft_snapshots: {
        Row: {
          id: string
          draft_id: string
          timestamp: string
          content_diff: string | null
          char_count_delta: number
          paste_event_detected: boolean
        }
        Insert: {
          id?: string
          draft_id: string
          timestamp?: string
          content_diff?: string | null
          char_count_delta: number
          paste_event_detected?: boolean
        }
        Update: {
          id?: string
          draft_id?: string
          timestamp?: string
          content_diff?: string | null
          char_count_delta?: number
          paste_event_detected?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'draft_snapshots_draft_id_fkey'
            columns: ['draft_id']
            referencedRelation: 'drafts'
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
