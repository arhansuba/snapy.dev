// src/db/connection.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: PrismaClient;

  private constructor() {
    this.client = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      (this.client.$on as any)('query', (e: Prisma.QueryEvent) => {
        logger.debug('Query: ' + e.query);
      });
    }

    // Log errors
    (this.client.$on as any)('error', (e: Prisma.LogEvent) => {
      logger.error('Database error:', e);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Simplified exports for easier usage
export const getPrismaClient = () => DatabaseConnection.getInstance().getClient();
export const connectDatabase = () => DatabaseConnection.getInstance().connect();
export const disconnectDatabase = () => DatabaseConnection.getInstance().disconnect();
export const checkDatabaseHealth = () => DatabaseConnection.getInstance().healthCheck();