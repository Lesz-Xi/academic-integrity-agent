import { describe, it, expect } from 'vitest';
import { geminiRateLimiter, serperRateLimiter, checkRateLimit } from './rateLimiter';

describe('Rate Limiter', () => {
  describe('geminiRateLimiter', () => {
    it('should allow requests within rate limit', () => {
      // Reset by creating new instance concept - but we use global limiters
      // For testing, we just verify the initial state allows requests
      const initialTokens = geminiRateLimiter.getTokenCount();
      expect(initialTokens).toBeGreaterThan(0);
    });

    it('should have correct max tokens configured', () => {
      // Gemini is configured with maxTokens: 5
      const tokens = geminiRateLimiter.getTokenCount();
      expect(tokens).toBeLessThanOrEqual(5);
    });
  });

  describe('serperRateLimiter', () => {
    it('should allow requests within rate limit', () => {
      const initialTokens = serperRateLimiter.getTokenCount();
      expect(initialTokens).toBeGreaterThan(0);
    });

    it('should have correct max tokens configured', () => {
      // Serper is configured with maxTokens: 3
      const tokens = serperRateLimiter.getTokenCount();
      expect(tokens).toBeLessThanOrEqual(3);
    });
  });

  describe('checkRateLimit', () => {
    it('should throw error when rate limit exceeded', () => {
      // Exhaust all tokens
      const limiter = {
        tryConsume: () => false,
        getWaitTime: () => 5000,
        getTokenCount: () => 0,
      };

      expect(() => checkRateLimit(limiter as any, 'Test API')).toThrow(
        'Rate limit exceeded for Test API'
      );
    });
  });
});
