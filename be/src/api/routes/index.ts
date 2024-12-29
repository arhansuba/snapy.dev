// src/api/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import paymentRoutes from './payment';
import projectRoutes from './project';
import aiRoutes from './ai';
import userRoutes from './user';
import { AuthMiddleware } from '../middleware/auth';
import { aiRateLimit } from '../middleware/ai-rate-limit.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/payment', AuthMiddleware.authenticate, aiRateLimit, paymentRoutes);
router.use('/projects', AuthMiddleware.authenticate, aiRateLimit, projectRoutes);
router.use('/ai', AuthMiddleware.authenticate, aiRateLimit, aiRoutes);
router.use('/users', AuthMiddleware.authenticate, aiRateLimit, userRoutes);

export default router;