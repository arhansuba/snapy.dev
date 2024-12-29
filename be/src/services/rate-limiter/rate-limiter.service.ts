// src/services/rate-limiter/rate-limiter.service.ts
import { redis } from '../redis/client';
import { RateLimitConfig, RateLimitInfo, RateLimitExceededError } from './types';
import { PlanType } from '../payment/plans';

export class RateLimiter {
  private readonly planLimits: Record<PlanType, RateLimitConfig> = {
    [PlanType.FREE]: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      keyPrefix: 'rl:free:'
    },
    [PlanType.BASIC]: {
      windowMs: 60 * 1000,
      maxRequests: 30,
      keyPrefix: 'rl:basic:'
    },
    [PlanType.PREMIUM]: {
      windowMs: 60 * 1000,
      maxRequests: 100,
      keyPrefix: 'rl:premium:'
    },
    [PlanType.ENTERPRISE]: {
      windowMs: 60 * 1000,
      maxRequests: 500,
      keyPrefix: 'rl:enterprise:'
    }
  };

  async checkLimit(userId: string, planType: PlanType): Promise<RateLimitInfo> {
    const config = this.planLimits[planType];
    const key = `${config.keyPrefix}${userId}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean old requests
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const requestCount = await redis.zcard(key);

    if (requestCount >= config.maxRequests) {
      const oldestTimestamp = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = Number(oldestTimestamp[1]) + config.windowMs;

      throw new RateLimitExceededError(
        'Rate limit exceeded',
        new Date(resetTime)
      );
    }

    // Add new request
    await redis.zadd(key, now, `${now}`);
    await redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      remaining: config.maxRequests - requestCount - 1,
      reset: now + config.windowMs,
      total: config.maxRequests
    };
  }
}