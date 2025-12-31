-- MIGRATION: Certificates Storage Bucket
-- =======================================

-- 1. Create the bucket if it doesn't exist
-- We must insert into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates', 
  'certificates', 
  true, 
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for the bucket
-- Note: Storage policies are on storage.objects

-- Allow public read access to certificates (needed for verification_url)
CREATE POLICY "Public Access to Certificates"
ON storage.objects FOR SELECT
USING ( bucket_id = 'certificates' );

-- Allow authenticated users (via Edge Function internal role or user token) to upload
-- The Edge Function usually runs with service_role, which bypasses RLS, but if we pass user token:
CREATE POLICY "Authenticated Users can Upload Certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
);
