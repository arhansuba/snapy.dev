// src/api/routes/ai.ts
import { Router } from 'express';
import { PromptUsageModel } from '../../db/models/PromptUsageModel';
import { validate } from '../middleware/validation/validator';
import { generateCodeSchema } from '../middleware/validation/schemas';
import { aiRateLimit } from '../middleware/ai-rate-limit.middleware';
import { DeepSeek } from '../../services/llm/deepseek';

const router = Router();

router.post(
  '/generate',
  validate(generateCodeSchema),
  aiRateLimit,
  async (req, res, next) => {
    try {
      const { prompt } = req.body;
      const llm = new DeepSeek();
      const response = await llm.generateCode(prompt);

      await PromptUsageModel.create(req.user!.id, {
        prompt,
        response,
        tokens: response.length // Simplified token counting
      });

      res.json({ code: response });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/usage', async (req, res, next) => {
  try {
    const usage = await PromptUsageModel.getUserUsageStats(req.user!.id);
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

export default router;