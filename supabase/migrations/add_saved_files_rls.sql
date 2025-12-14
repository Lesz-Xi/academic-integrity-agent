-- Enable RLS on saved_files table
ALTER TABLE saved_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own files
CREATE POLICY "Users can view own files"
  ON saved_files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own files
CREATE POLICY "Users can create own files"
  ON saved_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
  ON saved_files
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON saved_files
  FOR DELETE
  USING (auth.uid() = user_id);
