# Database Setup Plan - Academic Integrity Agent

## Overview
Set up Supabase PostgreSQL database with authentication, tables, and React integration for the academic integrity agent application.

## Current State
- ✅ Supabase account exists
- ✅ Table Editor open and ready
- ❌ No tables created yet
- ❌ No authentication configured
- ❌ Frontend using localStorage only

## Implementation Plan

### Phase 1: Database Schema Creation (SQL Editor)
**Critical Files**: `/supabase/migrations/`, new SQL files

1. **Create core tables** (users, generations, saved_files)
2. **Enable Row-Level Security (RLS)** policies
3. **Add indexes** for performance optimization
4. **Create helper functions** for common queries

### Phase 2: Supabase Client Integration
**Critical Files**:
- `/src/lib/supabase.ts` (new - client config)
- `/src/types/database.ts` (new - TypeScript types)
- `package.json` (add @supabase/supabase-js)

1. Install Supabase JavaScript client
2. Configure environment variables
3. Create TypeScript types from schema
4. Build React hooks for database operations

### Phase 3: Authentication Setup
**Critical Files**:
- `/src/contexts/AuthContext.tsx` (new)
- `/src/components/Auth/` (new folder with Login/Signup)
- `/src/App.tsx` (add auth routing)

1. Enable email/password auth in Supabase dashboard
2. Create auth context and hooks
3. Build login/signup components
4. Add protected routes

### Phase 4: Data Migration & Integration
**Critical Files**:
- `/src/hooks/useGenerationHistory.ts` (modify)
- `/src/App.tsx` (replace localStorage)
- `/src/utils/storage.ts` (new - database operations)

1. Migrate localStorage logic to Supabase
2. Update history management hooks
3. Add sync logic for offline/online states
4. Implement error handling and loading states

### Phase 5: Testing & Deployment
**Critical Files**:
- `/src/__tests__/database.test.ts` (new)
- `.env.example` (document required variables)

1. Test CRUD operations
2. Verify RLS policies work correctly
3. Test authentication flows
4. Update documentation

## Key Decisions
- **Database**: Supabase PostgreSQL (already chosen)
- **Auth Method**: Email/password (can add OAuth later)
- **Migration Strategy**: Gradual (keep localStorage as fallback initially)
- **Type Safety**: Generate TypeScript types from Supabase schema

## Success Criteria
- ✅ All tables created with proper RLS policies
- ✅ Users can register and login
- ✅ Generation history persists across devices
- ✅ No data exposed between users
- ✅ Existing app functionality preserved
