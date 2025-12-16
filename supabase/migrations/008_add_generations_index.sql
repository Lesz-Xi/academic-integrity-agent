-- Migration: Add index for faster usage count queries
-- This speeds up the getMonthlyUsage query which was timing out

-- Index for counting generations by user within a date range
CREATE INDEX IF NOT EXISTS idx_generations_user_created 
ON generations(user_id, created_at DESC);

-- Analyze table to update statistics for query planner
ANALYZE generations;
