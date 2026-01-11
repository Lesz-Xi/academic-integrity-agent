
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

    it('Undo Logic: Immediate deletion of paste should restore integrity?', () => {
        // 1. Organic Base
        const organicChars = Array(10).fill(1).map(() => ({ charCountDelta: 50, pasteEventDetected: false }));
        
        // 2. Large Paste (Accidental)
        const accidentalPaste = { charCountDelta: 5000, pasteEventDetected: true };
        
        // 3. Undo (Large Deletion) - Represented as negative delta
        const undoAction = { charCountDelta: -5000, pasteEventDetected: false };
        
        // Input is expected to be Newest First (DESC timestamp)
        // So Undo (latest) -> Paste (recent) -> Organic (oldest)
        const snapshots = [undoAction, accidentalPaste, ...organicChars.reverse()];
        
        const score = DraftService.computeScore(snapshots);
        
        console.log(`Undo Logic Score: ${score}%`);
        expect(score).toBeGreaterThan(90); // Should be recovered
    });
});
