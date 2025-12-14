-- Enable RLS on generations table
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own generations
CREATE POLICY "Users can view own generations"
  ON generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own generations
CREATE POLICY "Users can create own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own generations
CREATE POLICY "Users can update own generations"
  ON generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own generations
CREATE POLICY "Users can delete own generations"
  ON generations
  FOR DELETE
  USING (auth.uid() = user_id);
