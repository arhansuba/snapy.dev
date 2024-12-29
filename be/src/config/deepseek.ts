// src/config/deepseek.ts
interface DeepSeekConfig {
    apiKey: string;
    baseUrl: string;
    version: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
    retries: number;
  }
  
  const config: DeepSeekConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
    version: process.env.DEEPSEEK_API_VERSION || 'v1',
    maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '30000'),
    retries: parseInt(process.env.DEEPSEEK_RETRIES || '3'),
  };
  
  export const getRequestConfig = (prompt: string) => ({
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
    timeout: config.timeout,
  });
  
  export default config;