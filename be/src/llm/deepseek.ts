// src/llm/deepseek.ts
import fetch from 'node-fetch';
import { 
  LLMConfig, 
  LLMRequest, 
  LLMResponse, 
  CodeGenerationRequest,
  LLMError 
} from './types';
import { LLMCache } from './cache';
import { LLMRateLimiter } from './rate-limiter';
import config from '../config/deepseek';
import { logger } from '../utils/logger';

export class DeepSeek {
  private cache: LLMCache;
  private rateLimiter: LLMRateLimiter;
  
  constructor() {
    this.cache = new LLMCache();
    this.rateLimiter = new LLMRateLimiter();
  }

  private readonly defaultConfig: LLMConfig = {
    model: 'deepseek-coder-33b-instruct',
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    topP: 0.95,
    presencePenalty: 0,
    frequencyPenalty: 0,
  };

  async generateCode(request: CodeGenerationRequest): Promise<LLMResponse> {
    try {
      // Check rate limit
      await this.rateLimiter.checkLimit();

      // Check cache
      const cached = await this.cache.get(request);
      if (cached) return cached;

      // Prepare prompt based on request type
      const prompt = this.preparePrompt(request);

      // Make API request
      const response = await this.makeRequest({
        prompt,
        config: { ...this.defaultConfig, ...request.config }
      });

      // Cache response
      await this.cache.set(request, response);

      return response;
    } catch (error) {
      if (error instanceof LLMError) throw error;
      
      logger.error('DeepSeek generation error:', error);
      throw new LLMError(
        'Failed to generate code',
        LLMError.ErrorCodes.API_ERROR
      );
    }
  }

  private preparePrompt(request: CodeGenerationRequest): string {
    const { prompt, type, language = 'typescript', framework = 'react' } = request;

    const prompts = {
      component: `Create a ${framework} component that: ${prompt}\nUse ${language} and follow best practices.`,
      function: `Create a ${language} function that: ${prompt}\nProvide proper typing and error handling.`,
      api: `Create an API endpoint that: ${prompt}\nUse ${language} and include error handling and validation.`,
      full: `Create a full implementation that: ${prompt}\nUse ${language} and ${framework}.`,
    };

    return `${prompts[type]}\nRespond only with the code, no explanations.`;
  }

  private async makeRequest(request: LLMRequest): Promise<LLMResponse> {
    const { prompt, config = this.defaultConfig } = request;

    try {
      const response = await fetch(`${config.baseUrl}/v1/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: config.topP,
          presence_penalty: config.presencePenalty,
          frequency_penalty: config.frequencyPenalty,
          stop: config.stop,
        }),
        timeout: config.timeout,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new LLMError(
          error.message || 'API request failed',
          error.code || LLMError.ErrorCodes.API_ERROR,
          response.status
        );
      }

      const data = await response.json();
      
      return {
        text: data.text,
        tokens: data.usage.total_tokens,
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        finish_reason: data.finish_reason,
      };
    } catch (error) {
      if (error instanceof LLMError) throw error;
      
      logger.error('DeepSeek API error:', error);
      throw new LLMError(
        'Failed to communicate with DeepSeek API',
        LLMError.ErrorCodes.API_ERROR
      );
    }
  }
}