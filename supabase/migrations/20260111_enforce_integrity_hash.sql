-- Migration: Enforce integrity_hash on draft_snapshots
-- Date: 2026-01-11
-- Purpose: Hardening Phase 3 - Mandatory Chain of Custody

-- 1. Backfill existing NULL records with a placeholder to prevent migration failure.
-- "legacy_backfill": Explicit marker that these records predate the cryptographic chain.
UPDATE draft_snapshots
SET integrity_hash = 'legacy_backfill'
WHERE integrity_hash IS NULL;

-- 2. Enforce NOT NULL constraint
ALTER TABLE draft_snapshots
ALTER COLUMN integrity_hash SET NOT NULL;

-- 3. Verify index exists (Idempotent check)
CREATE INDEX IF NOT EXISTS idx_draft_snapshots_hash ON draft_snapshots(integrity_hash);
