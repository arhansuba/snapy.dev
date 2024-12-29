// src/llm/cache.ts
import { createHash } from 'crypto';
import { redis } from '../services/redis/client';
import { logger } from '../utils/logger';
import { 
  LLMCacheConfig, 
  LLMRequest, 
  LLMResponse, 
  CacheEntry,
  LLMError 
} from './types';

export class LLMCache {
  private readonly defaultConfig: LLMCacheConfig = {
    ttl: 24 * 60 * 60,     // 24 hours
    maxSize: 100,          // 100MB
    namespace: 'llm:cache'
  };

  constructor(private config: LLMCacheConfig = { ttl: 24 * 60 * 60, maxSize: 100, namespace: 'llm:cache' }) {
    this.config = { ...this.defaultConfig, ...config };
  }

  private generateKey(request: LLMRequest): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify({
      prompt: request.prompt,
      config: request.config
    }));
    return `${this.config.namespace}:${hash.digest('hex')}`;
  }

  async get(request: LLMRequest): Promise<LLMResponse | null> {
    try {
      const key = this.generateKey(request);
      const cached = await redis.get(key);

      if (!cached) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      
      // Check if cache entry has expired
      if (entry.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      logger.debug('Cache hit', { key });
      return entry.response;
    } catch (error) {
      logger.error('Cache get error:', error);
      throw new LLMError(
        'Failed to retrieve from cache',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }

  async set(request: LLMRequest, response: LLMResponse): Promise<void> {
    try {
      const key = this.generateKey(request);
      const now = Date.now();

      const entry: CacheEntry = {
        response,
        createdAt: now,
        expiresAt: now + (this.config.ttl * 1000)
      };

      // Check cache size before setting
      await this.ensureCacheSize();

      await redis.setex(
        key,
        this.config.ttl,
        JSON.stringify(entry)
      );

      logger.debug('Cache set', { key });
    } catch (error) {
      logger.error('Cache set error:', error);
      throw new LLMError(
        'Failed to store in cache',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug('Cache delete', { key });
    } catch (error) {
      logger.error('Cache delete error:', error);
      throw new LLMError(
        'Failed to delete from cache',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const pattern = `${this.config.namespace}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      logger.info('Cache cleared', { namespace: this.config.namespace });
    } catch (error) {
      logger.error('Cache clear error:', error);
      throw new LLMError(
        'Failed to clear cache',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }

  private async ensureCacheSize(): Promise<void> {
    try {
      const pattern = `${this.config.namespace}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) return;

      // Get cache size in MB
      const size = await this.getCacheSize(keys);
      
      if (size > this.config.maxSize) {
        // Sort by creation time and remove oldest entries
        const entries = await Promise.all(
          keys.map(async (key) => {
            const value = await redis.get(key);
            if (!value) return null;
            const entry: CacheEntry = JSON.parse(value);
            return { key, createdAt: entry.createdAt };
          })
        );

        // Filter out null entries and sort
        const validEntries = entries.filter((e): e is NonNullable<typeof e> => e !== null)
          .sort((a, b) => a.createdAt - b.createdAt);

        // Remove oldest entries until under max size
        for (const entry of validEntries) {
          await this.delete(entry.key);
          const newSize = await this.getCacheSize(await redis.keys(pattern));
          if (newSize <= this.config.maxSize) break;
        }
      }
    } catch (error) {
      logger.error('Cache size management error:', error);
      throw new LLMError(
        'Failed to manage cache size',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }

  private async getCacheSize(keys: string[]): Promise<number> {
    const sizes = await Promise.all(
      keys.map(key => redis.memory('USAGE', key))
    );
    const totalBytes = sizes.reduce((acc, size) => (acc ?? 0) + (size ?? 0), 0);
    return (totalBytes ?? 0) / (1024 * 1024); // Convert to MB
  }

  // Cache analytics methods
  async getStats(): Promise<{
    size: number;
    entries: number;
    hitRate: number;
  }> {
    try {
      const pattern = `${this.config.namespace}:*`;
      const keys = await redis.keys(pattern);
      const size = await this.getCacheSize(keys);

      // Get hit rate from Redis info
      const info = await redis.info('stats');
      const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
      const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
      const hitRate = hits / (hits + misses) || 0;

      return {
        size,
        entries: keys.length,
        hitRate
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      throw new LLMError(
        'Failed to get cache stats',
        LLMError.ErrorCodes.CACHE_ERROR
      );
    }
  }
}