-- FIX: PostgreSQL Trigger Error 2F005
-- ====================================
-- Error: "control reached end of trigger procedure without RETURN"
--
-- This recreates the handle_updated_at() function with proper RETURN statement
-- and security settings to fix the UPDATE error on drafts table.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$;

-- Verify the trigger exists and is properly configured
DO $$
BEGIN
  -- Drop and recreate trigger to ensure it uses the corrected function
  DROP TRIGGER IF EXISTS handle_drafts_updated_at ON public.drafts;
  
  CREATE TRIGGER handle_drafts_updated_at
    BEFORE UPDATE ON public.drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
    
  RAISE NOTICE 'Trigger handle_drafts_updated_at recreated successfully';
END;
$$;

-- Test: Update a draft to verify the trigger works
-- UPDATE public.drafts SET current_content = current_content WHERE id = (SELECT id FROM public.drafts LIMIT 1);
