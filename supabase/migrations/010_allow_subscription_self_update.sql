-- Allow users to update their own subscription records
-- This is needed for auto-premium-grant feature

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Allow users to INSERT their own subscription (for new users)
CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own subscription
CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to SELECT their own subscription (should already exist)
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
