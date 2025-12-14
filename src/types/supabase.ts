import type { Database } from './database.types'

// Helper types for working with Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type DbUser = Tables<'users'>
export type DbGeneration = Tables<'generations'>
export type DbSavedFile = Tables<'saved_files'>

// Insert types
export type DbUserInsert = Inserts<'users'>
export type DbGenerationInsert = Inserts<'generations'>
export type DbSavedFileInsert = Inserts<'saved_files'>

// Update types
export type DbUserUpdate = Updates<'users'>
export type DbGenerationUpdate = Updates<'generations'>
export type DbSavedFileUpdate = Updates<'saved_files'>
