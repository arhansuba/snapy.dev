// src/services/rate-limiter/burst-protection.ts
import { redis } from '../redis/client';
import { BurstConfig, RateLimitExceededError } from './types';

export class BurstProtection {
  private readonly configs: Record<string, BurstConfig> = {
    api: {
      windowMs: 1000,
      maxBurst: 5,
      keyPrefix: 'burst:api:'
    },
    auth: {
      windowMs: 1000,
      maxBurst: 3,
      keyPrefix: 'burst:auth:'
    },
    ai: {
      windowMs: 1000,
      maxBurst: 2,
      keyPrefix: 'burst:ai:'
    }
  };

  async checkBurst(key: string, type: keyof typeof this.configs): Promise<void> {
    const config = this.configs[type];
    const burstKey = `${config.keyPrefix}${key}`;
    const now = Date.now();
    
    // Clean old requests
    await redis.zremrangebyscore(burstKey, 0, now - config.windowMs);
    
    // Count current requests
    const burstCount = await redis.zcard(burstKey);
    
    if (burstCount >= config.maxBurst) {
      const oldestTimestamp = await redis.zrange(burstKey, 0, 0, 'WITHSCORES');
      const resetTime = Number(oldestTimestamp[1]) + config.windowMs;
      
      throw new RateLimitExceededError(
        'Too many requests in short time',
        new Date(resetTime)
      );
    }

    await redis.zadd(burstKey, now, `${now}`);
    await redis.expire(burstKey, Math.ceil(config.windowMs / 1000));
  }
}