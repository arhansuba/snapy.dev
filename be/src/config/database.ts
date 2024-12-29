// src/config/database.ts
import { PrismaClientOptions } from '@prisma/client';

interface DatabaseConfig {
  url: string;
  maxConnections: number;
  timeout: number;
  ssl: boolean;
}

const config: DatabaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aiappbuilder',
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
  timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
  ssl: process.env.DATABASE_SSL === 'true',
};

export const getPrismaConfig = (): PrismaClientOptions => ({
  datasources: {
    db: {
      url: config.url,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  connectionTimeout: config.timeout,
  __internal: {
    engine: {
      connectTimeout: config.timeout,
    },
  },
});

export default config;