-- COMBINED MIGRATION: Subscriptions + Security/Performance Fixes
-- Run this SINGLE file in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: CREATE SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  paypal_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 2: FIX SECURITY - MUTABLE SEARCH_PATH
-- ============================================

-- Fix update_updated_at_column function
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

-- Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix handle_new_user function (if exists)
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

-- Create/fix create_default_subscription function
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

-- Trigger to auto-create subscription when user is created
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON public.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();

-- ============================================
-- STEP 3: FIX PERFORMANCE - INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_files_user_id ON public.saved_files(user_id);

-- ============================================
-- STEP 4: RECREATE RLS POLICIES (OPTIMIZED)
-- ============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Generations table policies
DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can create own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can delete own generations" ON public.generations;

CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own generations" ON public.generations
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own generations" ON public.generations
  FOR DELETE USING (user_id = auth.uid());

-- Saved files table policies
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
-- STEP 5: ANALYZE TABLES
-- ============================================

ANALYZE public.users;
ANALYZE public.generations;
ANALYZE public.saved_files;
ANALYZE public.subscriptions;

-- ============================================
-- DONE! 
-- Remember to manually enable "Prevent leaked passwords"
-- in Authentication > Settings > Security
-- ============================================
