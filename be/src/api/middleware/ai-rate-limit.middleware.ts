// src/api/middleware/ai-rate-limit.middleware.ts
import { Response, NextFunction } from 'express';
import { redis } from '../../services/redis/client';
import { AuthenticatedRequest } from './auth';
import { PlanType } from '../../services/payment/plans';

// Rate limits per plan type (requests per day)
const AI_RATE_LIMITS: Record<PlanType, number> = {
 [PlanType.FREE]: 5,
 [PlanType.BASIC]: 50,
 [PlanType.PREMIUM]: 500,
 [PlanType.ENTERPRISE]: 2000
};

export const aiRateLimit = async (
 req: AuthenticatedRequest,
 res: Response,
 next: NextFunction
) => {
 try {
   if (!req.user) {
     return res.status(401).json({
       status: 'error',
       message: 'Authentication required'
     });
   }

   const { id: userId, planType } = req.user;
   const key = `ai-limit:${userId}:${new Date().toISOString().split('T')[0]}`;

   // Get current usage
   const currentUsage = await redis.incr(key);

   // Set expiry for first request
   if (currentUsage === 1) {
     // Expire at midnight
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);
     tomorrow.setHours(0, 0, 0, 0);
     const secondsUntilMidnight = Math.ceil((tomorrow.getTime() - Date.now()) / 1000);
     await redis.expire(key, secondsUntilMidnight);
   }

   const limit = AI_RATE_LIMITS[planType as PlanType] || AI_RATE_LIMITS.FREE;

   // Check if limit exceeded
   if (currentUsage > limit) {
     const resetTime = new Date();
     resetTime.setDate(resetTime.getDate() + 1);
     resetTime.setHours(0, 0, 0, 0);

     return res.status(429).json({
       status: 'error',
       message: 'AI generation limit exceeded',
       limit,
       current: currentUsage - 1, // Subtract the increment we just did
       resetAt: resetTime.toISOString(),
       upgradeUrl: '/pricing'
     });
   }

   // Add rate limit headers
   res.set({
     'X-RateLimit-Limit': limit.toString(),
     'X-RateLimit-Remaining': (limit - currentUsage).toString(),
     'X-RateLimit-Reset': new Date().setHours(24, 0, 0, 0).toString()
   });

   next();
 } catch (error) {
   next(error);
 }
};

// Optional: Monitoring function for admin dashboard
export const getAIUsageStats = async (userId: string) => {
 const today = new Date().toISOString().split('T')[0];
 const key = `ai-limit:${userId}:${today}`;
 const usage = await redis.get(key);
 
 return {
   usage: Number(usage) || 0,
   date: today
 };
};

// Optional: Reset function for testing or admin purposes
export const resetAILimit = async (userId: string) => {
 const today = new Date().toISOString().split('T')[0];
 const key = `ai-limit:${userId}:${today}`;
 await redis.del(key);
};