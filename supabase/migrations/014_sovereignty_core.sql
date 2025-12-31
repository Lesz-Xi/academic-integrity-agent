-- MIGRATION: Sovereignty Core (Forensics & Attestation)
-- ====================================================

-- 1. Modify draft_snapshots for Forensic Data
-- ===========================================
ALTER TABLE public.draft_snapshots 
ADD COLUMN IF NOT EXISTS telemetry_data JSONB, -- Stores keystroke dynamics, focus events
ADD COLUMN IF NOT EXISTS integrity_hash TEXT;  -- SHA-256(content + prev_hash + timestamp)

-- Add comment to explain columns
COMMENT ON COLUMN public.draft_snapshots.telemetry_data IS 'Keystroke dynamics (flight time, dwell time) and edit events for forensic analysis';
COMMENT ON COLUMN public.draft_snapshots.integrity_hash IS 'Cryptographic hash linking this snapshot to the previous one for chain-of-custody';

-- 2. Create Attestation Certificates Table
-- ========================================
CREATE TABLE IF NOT EXISTS public.attestation_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_id UUID NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  pdf_path TEXT NOT NULL, -- Path in Supabase Storage
  verification_url TEXT NOT NULL, -- Publicly accessible verification link
  integrity_score NUMERIC(5,2), -- 0-100 score based on telemetry analysis
  metadata JSONB DEFAULT '{}'::jsonb, -- distinct word count, total time, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.attestation_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own certificates
CREATE POLICY "Users can view own certificates" 
  ON public.attestation_certificates FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own certificates (usually done via Edge Function, but useful for testing)
CREATE POLICY "Users can insert own certificates" 
  ON public.attestation_certificates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Create Storage Bucket for Certificates (if not exists)
-- =========================================================
-- Note: This usually requires manual setup or seed script, 
-- but we can attempt to insert into storage.buckets if permissions allow.
-- For migration safety, we usually skip direct storage.buckets manipulation in SQL 
-- unless running as superuser/postgres. We will assume the bucket 'certificates' 
-- will be created via dashboard or separate admin script.

-- 4. Performance Indexes
-- ======================
CREATE INDEX IF NOT EXISTS idx_draft_snapshots_draft_id ON public.draft_snapshots(draft_id);
CREATE INDEX IF NOT EXISTS idx_attestation_user_id ON public.attestation_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_attestation_draft_id ON public.attestation_certificates(draft_id);
