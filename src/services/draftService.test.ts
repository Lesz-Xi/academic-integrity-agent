import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DraftService } from './draftService';
import { telemetryService } from './telemetryService';
import * as cryptoUtils from '../utils/crypto';

// Mock Supabase Client
// Robust Mock Builder
const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'draft-123', integrity_hash: 'prev-hash' }, error: null });
const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });

// Chain for draft_snapshots select: .select().eq().order().limit().single()
const mockSnapSelectChain = {
    eq: vi.fn().mockReturnValue({
        order: mockOrder
    })
};

// Chain for drafts update: .update().eq().select().single()
const mockUpdateChain = {
    eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
            single: mockSingle
        }) 
    })
};

const mockInsert = vi.fn().mockResolvedValue({ error: null });

const mockClient = {
    from: vi.fn().mockImplementation((table) => {
        if (table === 'draft_snapshots') {
             return {
                 select: vi.fn().mockReturnValue(mockSnapSelectChain),
                 insert: mockInsert
             };
        }
        if (table === 'drafts') {
            return {
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) }),
                update: vi.fn().mockReturnValue(mockUpdateChain)
            };
        }
        return {};
    })
};

// Mock Dependencies
vi.mock('./telemetryService', () => ({
    telemetryService: {
        getSessionMetrics: vi.fn()
    }
}));

vi.mock('../utils/crypto', () => ({
    calculateSnapshotHash: vi.fn().mockResolvedValue('mock-hash-123')
}));

describe('DraftService Red-Tape Protocol', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should REJECT snapshot save if telemetry is missing (Red-Tape)', async () => {
        // Setup: No telemetry
        (telemetryService.getSessionMetrics as any).mockReturnValue(null);

        await DraftService.updateDraft(
            'draft-123',
            'new content',
            'old', 
            true, // isPaste
            'user-1',
            undefined,
            mockClient as any
        );

        // Verify: Draft updated (we don't check draft update here easily without more mocks, 
        // but we verify snapshot insert was skipped)
        
        // Assert: insert should NOT be called for 'draft_snapshots'
        // But implementation might reuse 'from' for multiple tables.
        // Let's check the calls to 'from'.
        // Expect 'drafts' call (for update or select), but NOT 'draft_snapshots' call IF logic works.
        // Actually, logic is: return Early.
        
        // In the code:
        // if (!telemetry) return ...
        
        // So 'draft_snapshots' insert should not happen.
        // This relies on knowing if 'insert' was called on the object returned by 'from("draft_snapshots")'
        
        // Assert: Red-Tape means NO snapshot insert
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should PERMIT snapshot save if telemetry is present', async () => {
        // Setup: Telemetry present
        (telemetryService.getSessionMetrics as any).mockReturnValue({ keyCount: 5 });

        await DraftService.updateDraft(
            'draft-123',
            'new content',
            'old', 
            true, // isPaste
            'user-1',
            undefined,
            mockClient as any
        );

        // Verification of flow
        expect(cryptoUtils.calculateSnapshotHash).toHaveBeenCalled();
        
        // Assert: Insert was called with integrity_hash
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            integrity_hash: 'mock-hash-123'
        }));
    });
});
