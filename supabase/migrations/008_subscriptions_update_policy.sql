-- Migration: 008_subscriptions_update_policy.sql
-- Purpose: Add missing UPDATE policy for subscriptions table
-- Issue: Users could not update their own subscription (RLS blocking upserts)

-- Add UPDATE policy for subscriptions
-- Users can only update their own subscription
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Also ensure the policy uses optimized auth.uid() pattern
COMMENT ON POLICY "Users can update own subscription" ON public.subscriptions IS 
  'Allows users to update their own subscription record - needed for PayPal/Stripe upgrades';
