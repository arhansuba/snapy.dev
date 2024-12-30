// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import routes from './api/routes';
import { connectDatabase, disconnectDatabase } from './db/connection';
import { StripeService } from './services/payment/stripe.service';
import { redis } from './services/redis/client';
import { logger } from './utils/logger';
import { notFound, errorHandler } from './api/middleware/error';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();
// Load environment variables
config();

const prisma = new PrismaClient();

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Compression
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        // Check database connection
        const dbHealthy = await this.checkDatabaseHealth();
        // Check Redis connection
        const redisHealthy = await this.checkRedisHealth();

        if (!dbHealthy || !redisHealthy) {
          throw new Error('Service unhealthy');
        }

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealthy ? 'up' : 'down',
            redis: redisHealthy ? 'up' : 'down'
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: (error as Error).message
        });
      }
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Handle 404
    this.app.use(notFound);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      this.gracefulShutdown();
    });
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$connect();
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Initiating graceful shutdown...');

    try {
      // Disconnect from database
      await prisma.$disconnect();
      logger.info('Database disconnected');

      // Close Redis connection
      await redis.quit();
      logger.info('Redis disconnected');

      // Exit process
      process.exit(1);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      const PORT = process.env.PORT || 3001;

      // Initialize services
      await prisma.$connect();
      logger.info('Database connected successfully');

      // Initialize Stripe
      StripeService.initialize();
      logger.info('Stripe service initialized');

      // Start server
      this.app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app;