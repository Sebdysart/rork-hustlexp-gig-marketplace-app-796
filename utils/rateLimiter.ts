/**
 * Client-side rate limiter to prevent hitting API limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

class RateLimiter {
  private requests: RequestRecord[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  canMakeRequest(endpoint: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    
    // Clean up old requests outside the window
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );

    // Check if we're at the limit
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const retryAfter = Math.ceil(
        (oldestRequest.timestamp + this.config.windowMs - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  recordRequest(endpoint: string): void {
    this.requests.push({
      timestamp: Date.now(),
      endpoint,
    });
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  reset(): void {
    this.requests = [];
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter({
  maxRequests: 8, // Conservative limit
  windowMs: 60000, // 1 minute
});

export default RateLimiter;
