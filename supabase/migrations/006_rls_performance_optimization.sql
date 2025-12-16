-- FINAL OPTIMIZATION: Fix RLS Performance Issues
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Generations table
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can create own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;

-- Saved files table
DROP POLICY IF EXISTS "Users can view own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can create own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can delete own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can insert own saved files" ON public.saved_files;

-- Subscriptions table
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- ============================================
-- STEP 2: CREATE OPTIMIZED POLICIES
-- Key: Use (SELECT auth.uid()) - evaluated ONCE per query
-- ============================================

-- USERS TABLE (ONE policy per action)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

-- GENERATIONS TABLE (ONE policy per action)
CREATE POLICY "generations_select_own" ON public.generations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "generations_insert_own" ON public.generations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "generations_delete_own" ON public.generations
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SAVED FILES TABLE (ONE policy per action)
CREATE POLICY "saved_files_select_own" ON public.saved_files
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_files_insert_own" ON public.saved_files
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_files_delete_own" ON public.saved_files
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SUBSCRIPTIONS TABLE (ONE policy per action)
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================
-- STEP 3: DROP UNUSED INDEXES
-- Keep only essential indexes for RLS
-- ============================================

-- These indexes are now flagged as unused because
-- the primary key already handles id lookups
DROP INDEX IF EXISTS public.idx_users_id;

-- Keep user_id indexes - they're essential for RLS filtering
-- Do NOT drop: idx_generations_user_id, idx_saved_files_user_id, idx_subscriptions_user_id
-- These will become used once queries start flowing

-- ============================================
-- STEP 4: ANALYZE TABLES
-- ============================================

ANALYZE public.users;
ANALYZE public.generations;
ANALYZE public.saved_files;
ANALYZE public.subscriptions;

-- ============================================
-- DONE!
-- The advisor should now show significantly fewer issues.
-- Remaining warnings about "unused indexes" may resolve
-- after your app has been running for a while with traffic.
-- ============================================
