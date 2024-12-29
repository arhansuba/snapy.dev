// src/api/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../services/auth/jwt';

import { AuthError } from '../../services/auth/types';
import { UserModel } from '@/db/models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    planType: string;
  };
}

export class AuthMiddleware {
  static async authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new AuthError('No token provided');
      }

      const token = authHeader.split(' ')[1];
      const payload = JWTService.verifyToken(token);
      
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        throw new AuthError('User not found');
      }

      req.user = {
        id: user.id,
        email: user.email,
        planType: user.planType,
      };

      next();
    } catch (error) {
      next(new AuthError('Authentication failed'));
    }
  }

  static optional(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    AuthMiddleware.authenticate(req, res, next);
  }
}

// export { AuthMiddleware };