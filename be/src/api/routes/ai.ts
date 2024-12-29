// src/api/routes/ai.ts
import { Router } from 'express';
import { validate } from '../middleware/validation/validator';
import { generateCodeSchema } from '../middleware/validation/schemas';
import { PromptUsageModel } from '@/db/models/Prompt';
import { DeepSeek } from '@/llm/deepseek';

import { AuthenticatedRequest } from '../middleware/auth';
import { aiRateLimit } from '../middleware/ai-rate-limit.middleware';

const router = Router();

router.post(
  '/generate',
  validate(generateCodeSchema),
  aiRateLimit,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { prompt } = req.body;
      const llm = new DeepSeek();
      const response = await llm.generateCode(prompt);

      await PromptUsageModel.create(req.user!.id, {
        prompt,
        response: response.text, // Access the text property of LLMResponse
        tokens: response.tokens // Use the tokens from LLMResponse
      });

      res.json({ code: response.text });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/usage', async (req: AuthenticatedRequest, res, next) => {
  try {
    const usage = await PromptUsageModel.getUserUsageStats(req.user!.id);
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

export default router;