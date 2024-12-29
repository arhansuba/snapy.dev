import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the user property
interface UserRequest extends Request {
  user?: {
    plan: PlanType;
  };
}
import { PlanType } from '../../services/payment/plans';

export function requirePlan(allowedPlans: PlanType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPlan = (req as UserRequest).user?.plan;

    if (!userPlan || !allowedPlans.includes(userPlan)) {
      return res.status(403).json({ message: 'Access denied. Upgrade your plan to access this resource.' });
    }

    next();
  };
}
