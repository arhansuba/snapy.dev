// src/api/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import paymentRoutes from './payment';
import projectRoutes from './project';
import aiRoutes from './ai';
import userRoutes from './user';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimitByPlan } from '../middleware/rate-limit.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/payment', authenticate, rateLimitByPlan, paymentRoutes);
router.use('/projects', authenticate, rateLimitByPlan, projectRoutes);
router.use('/ai', authenticate, rateLimitByPlan, aiRoutes);
router.use('/users', authenticate, rateLimitByPlan, userRoutes);

export default router;