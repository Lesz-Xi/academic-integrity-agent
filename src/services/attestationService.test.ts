
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttestationService } from './attestationService';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

const mockClient: any = {
    from: vi.fn(() => ({
        select: mockSelect
    })),
    functions: {
        invoke: vi.fn()
    }
};

describe('AttestationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ order: mockOrder });
    });

    it('should map joined drafts correctly', async () => {
        const mockData = [
            {
                id: 'cert-123',
                draft_id: 'draft-abc',
                integrity_score: 95,
                created_at: '2025-01-01T12:00:00Z',
                metadata: { hash: '0xHash' },
                verification_url: 'https://storage/cert.pdf',
                drafts: { title: 'My Research Paper' } // Single object join (if one-to-one or one-to-many single)
            }
        ];

        mockOrder.mockResolvedValue({ data: mockData, error: null });

        const certs = await AttestationService.getCertificates('user-1', mockClient);
        
        expect(certs).toHaveLength(1);
        expect(certs[0].title).toBe('My Research Paper');
        expect(certs[0].hash).toBe('0xHash');
        expect(certs[0].pdf_url).toBe('https://storage/cert.pdf');
    });

    it('should handle missing title or missing metadata', async () => {
         const mockData = [
            {
                id: 'cert-456',
                draft_id: 'draft-xyz',
                integrity_score: 100,
                created_at: null,
                metadata: null,
                verification_url: '',
                drafts: null // Join failed or draft deleted
            }
        ];

        mockOrder.mockResolvedValue({ data: mockData, error: null });

        const certs = await AttestationService.getCertificates('user-1', mockClient);
        
        expect(certs[0].title).toBe('Untitled Draft');
        expect(certs[0].hash).toContain('0xcert-456'); // Fallback to ID
        expect(certs[0].date).toBe('Unknown Date');
    });
});
