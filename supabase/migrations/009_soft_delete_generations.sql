-- Migration: Add soft delete support to generations table
-- This prevents users from gaming the usage limit by deleting history

-- Add deleted_at column for soft delete
ALTER TABLE generations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient filtering of non-deleted items
CREATE INDEX IF NOT EXISTS idx_generations_deleted_at 
ON generations (deleted_at) 
WHERE deleted_at IS NULL;

-- Add UPDATE policy (was missing - needed for soft delete)
-- This allows users to update their own generations (specifically to set deleted_at)
DROP POLICY IF EXISTS "generations_update_own" ON public.generations;
CREATE POLICY "generations_update_own" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update the RLS policy comments to note soft delete behavior
COMMENT ON COLUMN generations.deleted_at IS 'Soft delete timestamp - NULL means not deleted. Usage counts include soft-deleted records.';
