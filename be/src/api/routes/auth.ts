// src/api/routes/auth.ts
import { Router } from 'express';
import { AuthService } from '../../services/auth/auth.service';
import { validate } from '../middleware/validation/validator';
import { registerSchema, loginSchema } from '../middleware/validation/schemas';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    const newToken = await AuthService.refreshToken(token);
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

export default router;