// src/api/routes/admin/monitoring.ts
import { Router } from 'express';
import { RateLimitMonitoring } from '../../../services/rate-limiter/monitoring';
import { AuthMiddleware } from '../../middleware/auth';

import { requireAdmin } from '../../middleware/admin.middleware';
import { validate } from '../../middleware/validation/validator';
import { z } from 'zod';

const router = Router();

const timeRangeSchema = z.object({
  query: z.object({
    range: z.enum(['hour', 'day', 'week']).default('day')
  })
});

// Get global metrics
router.get(
  '/metrics',
  AuthMiddleware.authenticate,
  requireAdmin,
  validate(timeRangeSchema),
  async (req, res, next) => {
    try {
      const range = req.query.range as 'hour' | 'day' | 'week';
      const metrics = await RateLimitMonitoring.getGlobalStats(range);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }
);

// Get user-specific metrics
router.get(
  '/metrics/user/:userId',
  AuthMiddleware.authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const stats = await RateLimitMonitoring.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Get blocked IPs
router.get(
  '/blocked-ips',
  AuthMiddleware.authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const blockedIPs = await RateLimitMonitoring.getIPBlockCount();
      res.json({ count: blockedIPs });
    } catch (error) {
      next(error);
    }
  }
);

// Clear rate limit for a user
router.post(
  '/clear-limits/:userId',
  AuthMiddleware.authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      await RateLimitMonitoring.clearUserLimits(req.params.userId);
      res.json({ message: 'Rate limits cleared successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;