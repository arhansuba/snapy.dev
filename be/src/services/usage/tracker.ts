// src/services/usage/tracker.ts
import { PromptUsageModel } from '../../db/models/PromptUsageModel';
import { PlanType } from '../../services/payment/plans';
import { redis } from '../../services/redis/client';
import { logger } from '../../utils/logger';

interface UsageMetrics {
  dailyPrompts: number;
  monthlyPrompts: number;
  totalTokens: number;
  averageTokensPerPrompt: number;
}

interface UsageLimits {
  dailyPromptLimit: number;
  monthlyPromptLimit: number;
  tokenLimit: number;
}

export class UsageTracker {
  private readonly redisKeyPrefix = 'usage:';

  private readonly planLimits: Record<PlanType, UsageLimits> = {
    FREE: {
      dailyPromptLimit: 5,
      monthlyPromptLimit: 100,
      tokenLimit: 4000
    },
    BASIC: {
      dailyPromptLimit: 20,
      monthlyPromptLimit: 500,
      tokenLimit: 8000
    },
    PREMIUM: {
      dailyPromptLimit: -1, // unlimited
      monthlyPromptLimit: -1,
      tokenLimit: 32000
    },
    ENTERPRISE: {
      dailyPromptLimit: -1,
      monthlyPromptLimit: -1,
      tokenLimit: -1
    }
  };

  async trackPromptUsage(
    userId: string,
    planType: PlanType,
    prompt: string,
    response: string,
    tokens: number
  ): Promise<void> {
    try {
      const dailyKey = this.getDailyKey(userId);
      const monthlyKey = this.getMonthlyKey(userId);

      // Check limits before tracking
      await this.checkUsageLimits(userId, planType);

      // Track in Redis for real-time limits
      const pipeline = redis.pipeline();
      pipeline.incr(dailyKey);
      pipeline.expire(dailyKey, 86400); // 24 hours
      pipeline.incr(monthlyKey);
      pipeline.expire(monthlyKey, 2592000); // 30 days

      await pipeline.exec();

      // Store in database for analytics
      await PromptUsageModel.create({
        userId,
        prompt,
        response,
        tokens
      });

      logger.info('Usage tracked', {
        userId,
        planType,
        tokens
      });
    } catch (error) {
      logger.error('Failed to track usage:', error);
      throw new Error('Failed to track usage');
    }
  }

  async getUserMetrics(userId: string): Promise<UsageMetrics> {
    try {
      const [
        dailyPrompts,
        monthlyPrompts,
        usageStats
      ] = await Promise.all([
        this.getDailyPrompts(userId),
        this.getMonthlyPrompts(userId),
        PromptUsageModel.getUserUsageStats(userId)
      ]);

      return {
        dailyPrompts: Number(dailyPrompts || 0),
        monthlyPrompts: Number(monthlyPrompts || 0),
        totalTokens: usageStats.totalTokens,
        averageTokensPerPrompt: usageStats.averageTokens
      };
    } catch (error) {
      logger.error('Failed to get user metrics:', error);
      throw new Error('Failed to get usage metrics');
    }
  }

  async checkUsageLimits(userId: string, planType: PlanType): Promise<void> {
    const limits = this.planLimits[planType];
    const metrics = await this.getUserMetrics(userId);

    if (limits.dailyPromptLimit !== -1 && 
        metrics.dailyPrompts >= limits.dailyPromptLimit) {
      throw new Error('Daily prompt limit exceeded');
    }

    if (limits.monthlyPromptLimit !== -1 && 
        metrics.monthlyPrompts >= limits.monthlyPromptLimit) {
      throw new Error('Monthly prompt limit exceeded');
    }

    if (limits.tokenLimit !== -1 && 
        metrics.totalTokens >= limits.tokenLimit) {
      throw new Error('Token limit exceeded');
    }
  }

  async resetDailyUsage(userId: string): Promise<void> {
    await redis.del(this.getDailyKey(userId));
  }

  async resetMonthlyUsage(userId: string): Promise<void> {
    await redis.del(this.getMonthlyKey(userId));
  }

  private getDailyKey(userId: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${this.redisKeyPrefix}daily:${userId}:${date}`;
  }

  private getMonthlyKey(userId: string): string {
    const date = new Date().toISOString().slice(0, 7);
    return `${this.redisKeyPrefix}monthly:${userId}:${date}`;
  }

  private async getDailyPrompts(userId: string): Promise<number> {
    return Number(await redis.get(this.getDailyKey(userId))) || 0;
  }

  private async getMonthlyPrompts(userId: string): Promise<number> {
    return Number(await redis.get(this.getMonthlyKey(userId))) || 0;
  }
}