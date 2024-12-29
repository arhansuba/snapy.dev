// src/llm/types.ts
export interface LLMConfig {
    baseUrl: any;
    apiKey: any;
    timeout: number | undefined;
    model: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop?: string[];
  }
  
  export interface LLMResponse {
    text: string;
    tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    finish_reason: 'stop' | 'length' | 'content_filter';
  }
  
  export interface LLMRequest {
    prompt: string;
    config?: Partial<LLMConfig>;
  }
  
  export interface CodeGenerationRequest extends LLMRequest {
    language?: string;
    framework?: string;
    type: 'component' | 'function' | 'api' | 'full';
  }
  
  export interface LLMCacheConfig {
    ttl: number;              // Time to live in seconds
    maxSize: number;          // Maximum cache size in MB
    namespace: string;        // Cache namespace for different types of requests
  }
  
  export interface CacheEntry {
    response: LLMResponse;
    createdAt: number;
    expiresAt: number;
  }
  
  export class LLMError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500
    ) {
      super(message);
      this.name = 'LLMError';
    }
  
    static readonly ErrorCodes = {
      RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
      INVALID_REQUEST: 'invalid_request',
      CONTEXT_LENGTH_EXCEEDED: 'context_length_exceeded',
      API_ERROR: 'api_error',
      CACHE_ERROR: 'cache_error'
    } as const;
  }