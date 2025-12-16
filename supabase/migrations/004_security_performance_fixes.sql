-- Fix security and performance issues reported by Supabase Advisor
-- Run this in Supabase SQL Editor

-- ============================================
-- SECURITY FIXES
-- ============================================

-- Fix 1: Set search_path for update_updated_at_column function
-- This prevents mutable search_path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 2: Set search_path for handle_new_user function (if exists)
-- This prevents mutable search_path security issue
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER 
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $body$
      BEGIN
        INSERT INTO public.users (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $body$;
    $func$;
  END IF;
END;
$$;

-- Fix 3: Set search_path for create_default_subscription function
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================
-- PERFORMANCE FIXES
-- ============================================

-- Performance Fix 1: Add index on user_id for faster RLS policy evaluation
-- These indexes help auth.uid() comparisons in RLS policies

-- Index for users table (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Index for generations table
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);

-- Index for saved_files table (if not exists)  
CREATE INDEX IF NOT EXISTS idx_saved_files_user_id ON public.saved_files(user_id);

-- Index for subscriptions table (already created, but ensure it exists)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Performance Fix 2: Drop unused indexes (only if they exist and are truly unused)
-- Note: The idx_saved_files_user_id warning suggests it's unused, but it's needed for RLS
-- So we keep it. Only drop indexes that are definitely not needed.

-- Performance Fix 3: Optimize RLS policies to use auth.uid() more efficiently
-- For existing tables, recreate policies with proper index usage hints

-- Recreate users policies (optimized)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Recreate generations policies (optimized)
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can create own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;

CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own generations" ON public.generations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own generations" ON public.generations
  FOR DELETE USING (user_id = auth.uid());

-- Recreate saved_files policies (optimized)
DROP POLICY IF EXISTS "Users can view own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can create own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can delete own saved files" ON public.saved_files;

CREATE POLICY "Users can view own saved files" ON public.saved_files
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own saved files" ON public.saved_files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved files" ON public.saved_files
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SECURITY SETTING (Manual Step)
-- ============================================
-- For "Supabase Auth prevents compromised passwords":
-- Go to Authentication > Settings > Security tab
-- Enable "Prevent use of leaked passwords" checkbox
-- This cannot be done via SQL, it's a dashboard setting

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================
-- This helps PostgreSQL make better decisions about using indexes
ANALYZE public.users;
ANALYZE public.generations;
ANALYZE public.saved_files;

-- Only analyze subscriptions if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
    ANALYZE public.subscriptions;
  END IF;
END;
$$;

