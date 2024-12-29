// src/services/rate-limiter/ip-rate-limiter.ts
import { redis } from '../redis/client';
import { IPRateLimitConfig, RateLimitExceededError } from './types';

export class IPRateLimiter {
  private readonly config: IPRateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyPrefix: 'rl:ip:',
    blockDuration: 24 * 60 * 60 // 24 hours
  };

  private readonly strictConfig: IPRateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyPrefix: 'rl:ip:strict:',
    blockDuration: 24 * 60 * 60
  };

  async checkLimit(ip: string, strict: boolean = false): Promise<void> {
    const config = strict ? this.strictConfig : this.config;
    const key = `${config.keyPrefix}${ip}`;

    // Check if IP is blocked
    const isBlocked = await this.isIPBlocked(ip);
    if (isBlocked) {
      throw new RateLimitExceededError(
        'IP is blocked',
        new Date(Date.now() + config.blockDuration * 1000)
      );
    }

    const now = Date.now();
    await redis.zremrangebyscore(key, 0, now - config.windowMs);
    const count = await redis.zcard(key);

    if (count >= config.maxRequests) {
      await this.blockIP(ip, config.blockDuration);
      throw new RateLimitExceededError(
        'IP rate limit exceeded',
        new Date(now + config.windowMs)
      );
    }

    await redis.zadd(key, now, `${now}`);
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }

  async isIPBlocked(ip: string): Promise<boolean> {
    const blockedKey = `blocklist:ip:${ip}`;
    return await redis.exists(blockedKey) === 1;
  }

  async blockIP(ip: string, duration: number): Promise<void> {
    const blockedKey = `blocklist:ip:${ip}`;
    await redis.setex(blockedKey, duration, '1');
  }

  async unblockIP(ip: string): Promise<void> {
    const blockedKey = `blocklist:ip:${ip}`;
    await redis.del(blockedKey);
  }
}