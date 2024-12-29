// frontend/src/hooks/useAIGeneration.ts
import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { api } from '../utils/api';

interface GenerationOptions {
  type: 'component' | 'page' | 'api' | 'function';
  framework?: 'react' | 'vue' | 'angular';
  styling?: 'tailwind' | 'css' | 'scss';
}

interface GenerationResult {
  code: string;
  language: string;
  tokens: number;
}

export const useAIGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkPlanAccess } = useSubscription();

  const generateCode = useCallback(async (
    prompt: string,
    options: GenerationOptions
  ): Promise<GenerationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/generate', {
        prompt,
        ...options
      });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const enhancePrompt = useCallback((prompt: string, options: GenerationOptions): string => {
    const frameworkContext = options.framework ? `using ${options.framework}` : '';
    const stylingContext = options.styling ? `with ${options.styling} styling` : '';
    
    return `Generate ${options.type} ${frameworkContext} ${stylingContext}: ${prompt}
    Include error handling, TypeScript types, and follow best practices.`;
  }, []);

  const validateGeneration = useCallback((code: string): boolean => {
    // Basic validation - could be expanded based on needs
    return code.length > 0 && !code.includes('```');
  }, []);

  return {
    generateCode,
    enhancePrompt,
    validateGeneration,
    loading,
    error
  };
};