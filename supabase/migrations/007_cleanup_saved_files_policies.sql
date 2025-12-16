-- FINAL CLEANUP: Remove legacy saved_files policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop ALL possible legacy policy names for saved_files
DROP POLICY IF EXISTS "Users can view own files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can insert own files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can view own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can create own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can delete own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can insert own saved files" ON public.saved_files;

-- Drop and recreate the optimized policies (ensures clean state)
DROP POLICY IF EXISTS "saved_files_select_own" ON public.saved_files;
DROP POLICY IF EXISTS "saved_files_insert_own" ON public.saved_files;
DROP POLICY IF EXISTS "saved_files_delete_own" ON public.saved_files;

CREATE POLICY "saved_files_select_own" ON public.saved_files
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_files_insert_own" ON public.saved_files
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_files_delete_own" ON public.saved_files
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Analyze table
ANALYZE public.saved_files;

-- Done! Refresh advisor to verify.
