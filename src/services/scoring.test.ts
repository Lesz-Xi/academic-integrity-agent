
import { describe, it, expect } from 'vitest';
import { DraftService } from './draftService';

describe('DraftService.computeScore Forensic Analysis', () => {
    it('should return 0 or low score for immediate large paste on empty draft', () => {
        // Timeline:
        // 1. Snapshot 1: Paste 3718 chars. (Genesis + Paste combined or just first event)
        // Scenario: User opens editor (empty). Pastes text.
        // Snapshot created: charCountDelta = 3718, pasteEventDetected = true.
        
        const snapshots = [
            { charCountDelta: 3718, pasteEventDetected: true }
        ];
        
        const score = DraftService.computeScore(snapshots);
        console.log('Calculated Score (Paste Only):', score);
        
        expect(score).toBeLessThan(50); // Should be severely penalized
    });
    
    it('should return 0 for large text added without paste flag (High Velocity)', () => {
        const snapshots = [
            { charCountDelta: 3718, pasteEventDetected: false } // > 500 chars heuristic
        ];
        
        const score = DraftService.computeScore(snapshots);
        console.log('Calculated Score (High Velocity):', score);
        
        expect(score).toBeLessThan(50);
    });

    it('should return 100 for organic typing', () => {
        const snapshots = [
            { charCountDelta: 10, pasteEventDetected: false },
            { charCountDelta: 15, pasteEventDetected: false },
            { charCountDelta: 5, pasteEventDetected: false }
        ];
        // Total 30. Paste 0. Ratio 1.0
        const score = DraftService.computeScore(snapshots);
        expect(score).toBe(100);
    });
});
