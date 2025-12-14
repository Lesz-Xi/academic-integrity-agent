/**
 * Client-side Rate Limiter using Token Bucket Algorithm
 * Prevents API quota exhaustion attacks and ensures fair usage
 */

interface RateLimiterConfig {
  maxTokens: number;      // Maximum tokens in the bucket
  refillRate: number;     // Tokens added per second
  refillInterval: number; // Interval in ms to refill tokens
}

class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefillTime: number;

  constructor(config: RateLimiterConfig) {
    this.maxTokens = config.maxTokens;
    this.tokens = config.maxTokens;
    this.refillRate = config.refillRate;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefillTime) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  /**
   * Attempt to consume a token
   * @returns true if token consumed, false if rate limited
   */
  tryConsume(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }

  /**
   * Get time in ms until next token is available
   */
  getWaitTime(): number {
    this.refill();
    
    if (this.tokens >= 1) {
      return 0;
    }
    
    const tokensNeeded = 1 - this.tokens;
    return Math.ceil((tokensNeeded / this.refillRate) * 1000);
  }

  /**
   * Get current token count (for debugging)
   */
  getTokenCount(): number {
    this.refill();
    return this.tokens;
  }
}

// Rate limiters for different services
// Gemini: 10 requests per minute max (conservative)
export const geminiRateLimiter = new RateLimiter({
  maxTokens: 5,         // Allow burst of 5
  refillRate: 0.167,    // ~10 per minute (1/6 per second)
  refillInterval: 1000,
});

// Serper: 5 requests per minute (conservative for free tier)
export const serperRateLimiter = new RateLimiter({
  maxTokens: 3,         // Allow burst of 3
  refillRate: 0.083,    // ~5 per minute
  refillInterval: 1000,
});

/**
 * Check rate limit and throw error if exceeded
 */
export function checkRateLimit(limiter: RateLimiter, serviceName: string): void {
  if (!limiter.tryConsume()) {
    const waitTime = limiter.getWaitTime();
    const waitSeconds = Math.ceil(waitTime / 1000);
    throw new Error(
      `Rate limit exceeded for ${serviceName}. Please wait ${waitSeconds} seconds before trying again.`
    );
  }
}

/**
 * Async rate limit check that waits instead of throwing
 */
export async function waitForRateLimit(limiter: RateLimiter): Promise<void> {
  const waitTime = limiter.getWaitTime();
  if (waitTime > 0) {
    console.log(`[RateLimiter] Waiting ${waitTime}ms before proceeding...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  limiter.tryConsume();
}
