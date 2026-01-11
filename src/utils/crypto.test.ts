import { describe, it, expect } from 'vitest';
import { calculateSnapshotHash } from './crypto';

// Polyfill for crypto in Node environment (Vitest) if needed, 
// strictly speaking regular Vitest setup usually has access to crypto, 
// but we might need to mock or ensure it's available.
// Since modern Node has global.crypto, this should work standard.

describe('calculateSnapshotHash', () => {
  it('should generate a valid SHA-256 hex string', async () => {
    const hash = await calculateSnapshotHash('hello world', '2026-01-01T00:00:00Z', 'prev_hash_123');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate different hashes for different content', async () => {
    const hash1 = await calculateSnapshotHash('content A', '2026-01-01T00:00:00Z', 'prev_hash_123');
    const hash2 = await calculateSnapshotHash('content B', '2026-01-01T00:00:00Z', 'prev_hash_123');
    expect(hash1).not.toBe(hash2);
  });

  it('should generate deterministic hashes for same input', async () => {
    const input = ['same content', '2026-01-01T00:00:00Z', 'prev_hash_123'] as const;
    const hash1 = await calculateSnapshotHash(...input);
    const hash2 = await calculateSnapshotHash(...input);
    expect(hash1).toBe(hash2);
  });
});
