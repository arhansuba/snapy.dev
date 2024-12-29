// src/services/rate-limiter/monitoring.ts
import { redis } from '../redis/client';
import { PlanType } from '../../db/models/types';

export interface RateLimitMetrics {
  total: number;
  remaining: number;
  blocked: number;
  resetTime: number;
}

export interface GlobalMetrics {
  totalRequests: number;
  blockedRequests: number;
  activeUsers: number;
  requestsByPlan: Record<PlanType, number>;
  ipBlocks: number;
}

export class RateLimitMonitoring {
  private static readonly METRICS_RETENTION = 60 * 60 * 24 * 7; // 7 days

  static async trackRequest(
    userId: string,
    planType: PlanType,
    isBlocked: boolean
  ): Promise<void> {
    const now = Date.now();
    const dayKey = this.getDayKey(now);

    const pipeline = redis.pipeline();
    
    // Increment total requests
    pipeline.hincrby(`metrics:${dayKey}:total`, planType, 1);
    
    // Track blocked requests
    if (isBlocked) {
      pipeline.hincrby(`metrics:${dayKey}:blocked`, planType, 1);
    }

    // Track active users
    pipeline.sadd(`metrics:${dayKey}:active_users`, userId);

    await pipeline.exec();
  }

  static async getUserStats(userId: string): Promise<Record<string, RateLimitMetrics>> {
    const stats: Record<string, RateLimitMetrics> = {};
    const prefixes = ['rl:free:', 'rl:basic:', 'rl:premium:', 'rl:enterprise:', 'rl:ai:'];
    
    for (const prefix of prefixes) {
      const key = `${prefix}${userId}`;
      const count = await redis.zcard(key);
      const maxRequests = this.getMaxRequestsByPrefix(prefix);
      
      stats[prefix] = {
        total: maxRequests,
        remaining: maxRequests - count,
        blocked: 0, // Will be updated if user is blocked
        resetTime: await this.getResetTime(key)
      };
    }
    
    return stats;
  }

  static async getGlobalStats(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<GlobalMetrics> {
    const now = Date.now();
    const keys = this.getKeysForTimeRange(now, timeRange);
    
    const metrics: GlobalMetrics = {
      totalRequests: 0,
      blockedRequests: 0,
      activeUsers: 0,
      requestsByPlan: {
        [PlanType.FREE]: 0,
        [PlanType.BASIC]: 0,
        [PlanType.PREMIUM]: 0,
        [PlanType.ENTERPRISE]: 0
      },
      ipBlocks: 0
    };

    for (const key of keys) {
      const [totalRequests, blockedRequests, activeUsers] = await Promise.all([
        redis.hgetall(`metrics:${key}:total`),
        redis.hgetall(`metrics:${key}:blocked`),
        redis.scard(`metrics:${key}:active_users`)
      ]);

      // Aggregate metrics
      Object.entries(totalRequests).forEach(([plan, count]) => {
        metrics.requestsByPlan[plan as PlanType] += parseInt(count);
        metrics.totalRequests += parseInt(count);
      });

      Object.values(blockedRequests).forEach(count => {
        metrics.blockedRequests += parseInt(count);
      });

      metrics.activeUsers += activeUsers;
    }

    // Get current IP blocks
    metrics.ipBlocks = await this.getIPBlockCount();

    return metrics;
  }

  private static async getIPBlockCount(): Promise<number> {
    const keys = await redis.keys('blocklist:ip:*');
    return keys.length;
  }

  private static getDayKey(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  private static getKeysForTimeRange(
    now: number,
    range: 'hour' | 'day' | 'week'
  ): string[] {
    const keys: string[] = [];
    const date = new Date(now);
    
    switch (range) {
      case 'hour':
        keys.push(this.getDayKey(now));
        break;
      case 'day':
        keys.push(this.getDayKey(now));
        break;
      case 'week':
        for (let i = 0; i < 7; i++) {
          keys.push(this.getDayKey(date.getTime()));
          date.setDate(date.getDate() - 1);
        }
        break;
    }
    
    return keys;
  }

  private static async getResetTime(key: string): Promise<number> {
    const ttl = await redis.ttl(key);
    return Date.now() + (ttl * 1000);
  }

  private static getMaxRequestsByPrefix(prefix: string): number {
    switch (prefix) {
      case 'rl:free:': return 10;
      case 'rl:basic:': return 30;
      case 'rl:premium:': return 100;
      case 'rl:enterprise:': return 500;
      case 'rl:ai:': return 5;
      default: return 0;
    }
  }
}