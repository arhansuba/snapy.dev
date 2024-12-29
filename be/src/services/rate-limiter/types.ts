// src/services/rate-limiter/types.ts
export interface RateLimitConfig {
    windowMs: number;    // Time window in milliseconds
    maxRequests: number; // Maximum requests allowed in window
    keyPrefix: string;   // Redis key prefix
  }
  
  export interface RateLimitInfo {
    remaining: number;   // Remaining requests
    reset: number;      // Time until reset (Unix timestamp)
    total: number;      // Total requests allowed
  }
  
  export interface BurstConfig {
    windowMs: number;
    maxBurst: number;
    keyPrefix: string;
  }
  
  export interface IPRateLimitConfig extends RateLimitConfig {
    blockDuration: number; // Duration in seconds to block IP after limit exceeded
  }
  
  export class RateLimitExceededError extends Error {
    constructor(message: string, public reset: Date) {
      super(message);
      this.name = 'RateLimitExceededError';
    }
  }