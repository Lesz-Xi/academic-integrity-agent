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
      attestation_certificates: {
        Row: {
          created_at: string | null
          draft_id: string
          id: string
          integrity_score: number | null
          metadata: Json | null
          pdf_path: string
          user_id: string
          verification_url: string
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          id?: string
          integrity_score?: number | null
          metadata?: Json | null
          pdf_path: string
          user_id: string
          verification_url: string
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          id?: string
          integrity_score?: number | null
          metadata?: Json | null
          pdf_path?: string
          user_id?: string
          verification_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestation_certificates_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_snapshots: {
        Row: {
          char_count_delta: number | null
          content_diff: string | null
          created_at: string
          draft_id: string
          id: string
          integrity_hash: string | null
          paste_event_detected: boolean | null
          telemetry_data: Json | null
          timestamp: string
        }
        Insert: {
          char_count_delta?: number | null
          content_diff?: string | null
          created_at?: string
          draft_id: string
          id?: string
          integrity_hash?: string | null
          paste_event_detected?: boolean | null
          telemetry_data?: Json | null
          timestamp?: string
        }
        Update: {
          char_count_delta?: number | null
          content_diff?: string | null
          created_at?: string
          draft_id?: string
          id?: string
          integrity_hash?: string | null
          paste_event_detected?: boolean | null
          telemetry_data?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_snapshots_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          created_at: string
          current_content: string | null
          id: string
          last_updated: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_content?: string | null
          id?: string
          last_updated?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_content?: string | null
          id?: string
          last_updated?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          input: string
          metrics: Json | null
          mode: string | null
          output: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          input: string
          metrics?: Json | null
          mode?: string | null
          output: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          input?: string
          metrics?: Json | null
          mode?: string | null
          output?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_files: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paypal_subscription_id: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paypal_subscription_id?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          theme: string | null
          disclaimer_accepted: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          theme?: string | null
          disclaimer_accepted?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          theme?: string | null
          disclaimer_accepted?: boolean | null
        }
        Relationships: []
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
