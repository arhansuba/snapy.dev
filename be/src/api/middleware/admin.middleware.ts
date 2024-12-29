// src/api/middleware/admin.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user is admin (you'll need to add isAdmin field to user model)
    const isAdmin = await checkUserIsAdmin(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

async function checkUserIsAdmin(userId: string): Promise<boolean> {
  // Implement your admin check logic here
  // This could be a database query or a role check
  return true; // Placeholder
}