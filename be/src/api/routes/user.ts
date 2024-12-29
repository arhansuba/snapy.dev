// src/api/routes/user.ts
import { Router, Request } from 'express';
import { UserModel } from '../../db/models/User';
import { validate } from '../middleware/validation/validator';
import { updateProfileSchema } from '../middleware/validation/schemas';
import { PromptUsageModel } from '../../db/models/Prompt';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const router = Router();

router.get('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...profile } = user;
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/profile',
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const updatedUser = await UserModel.update(req.user!.id, req.body);
      const { password, ...profile } = updatedUser;
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/subscription', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const usage = await PromptUsageModel.getUserDailyUsage(user.id);
    res.json({
      plan: user.planType,
      promptsUsed: usage
    });
  } catch (error) {
    next(error);
  }
});

export default router;