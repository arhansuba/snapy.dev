// src/llm/rate-limiter.ts
import { redis } from '../services/redis/client';
import { LLMError } from './types';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export class LLMRateLimiter {
  private readonly config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,     // 50 requests per minute
    keyPrefix: 'llm:ratelimit:',
  };

  private readonly userLimits: Record<string, number> = {
    free: 10,
    basic: 50,
    premium: 200,
    enterprise: 500,
  };

  async checkLimit(userId?: string, userType: keyof typeof this.userLimits = 'free'): Promise<void> {
    try {
      const key = userId 
        ? `${this.config.keyPrefix}user:${userId}`
        : `${this.config.keyPrefix}ip:${this.getClientIp()}`;

      const maxRequests = userId 
        ? this.userLimits[userType]
        : this.config.maxRequests;

      const requests = await this.getCurrentRequests(key);

      if (requests >= maxRequests) {
        const ttl = await redis.pttl(key);
        throw new LLMError(
          `Rate limit exceeded. Try again in ${Math.ceil(ttl / 1000)} seconds`,
          LLMError.ErrorCodes.RATE_LIMIT_EXCEEDED,
          429
        );
      }

      await this.incrementRequests(key);
    } catch (error) {
      if (error instanceof LLMError) throw error;
      
      logger.error('Rate limiter error:', error);
      throw new LLMError(
        'Rate limit check failed',
        LLMError.ErrorCodes.API_ERROR
      );
    }
  }

  private async getCurrentRequests(key: string): Promise<number> {
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
  }

  private async incrementRequests(key: string): Promise<void> {
    await redis
      .multi()
      .incr(key)
      .pexpire(key, this.config.windowMs)
      .exec();
  }

  async getRemainingRequests(userId?: string, userType: keyof typeof this.userLimits = 'free'): Promise<number> {
    const key = userId 
      ? `${this.config.keyPrefix}user:${userId}`
      : `${this.config.keyPrefix}ip:${this.getClientIp()}`;

    const maxRequests = userId 
      ? this.userLimits[userType]
      : this.config.maxRequests;

    const current = await this.getCurrentRequests(key);
    return Math.max(0, maxRequests - current);
  }

  async resetLimit(userId?: string): Promise<void> {
    const key = userId 
      ? `${this.config.keyPrefix}user:${userId}`
      : `${this.config.keyPrefix}ip:${this.getClientIp()}`;

    await redis.del(key);
  }

  private getClientIp(): string {
    // This should be implemented based on your application's needs
    // You might want to get this from request headers or environment
    return 'default-ip';
  }

  // Analytics methods
  async getUsageStats(userId?: string, userType: keyof typeof this.userLimits = 'free'): Promise<{
    total: number;
    remaining: number;
    resetTime: number;
  }> {
    const key = userId 
      ? `${this.config.keyPrefix}user:${userId}`
      : `${this.config.keyPrefix}ip:${this.getClientIp()}`;

    const [current, ttl] = await Promise.all([
      this.getCurrentRequests(key),
      redis.pttl(key)
    ]);

    const maxRequests = userId 
      ? this.userLimits[userType]
      : this.config.maxRequests;

    return {
      total: maxRequests,
      remaining: Math.max(0, maxRequests - current),
      resetTime: Date.now() + ttl,
    };
  }
}