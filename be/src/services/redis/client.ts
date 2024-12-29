// src/services/redis/client.ts
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

class RedisClient {
  private static instance: Redis;
  private static isConnected: boolean = false;

  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.setupEventHandlers();
    }
    return this.instance;
  }

  private static setupEventHandlers() {
    this.instance.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.instance.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis error:', error);
    });

    this.instance.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const result = await this.instance.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export const redis = RedisClient.getInstance();
export default redis;