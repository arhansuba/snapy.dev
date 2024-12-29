// src/api/middleware/plan.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { PlanType } from '../../db/models/types';
import { PLANS } from '../../services/payment/plans';

export class PlanMiddleware {
  static requirePlan(allowedPlans: PlanType[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!allowedPlans.includes(req.user.planType as PlanType)) {
        return res.status(403).json({
          status: 'error',
          message: 'Upgrade required to access this feature',
          requiredPlans: allowedPlans,
          currentPlan: req.user.planType
        });
      }

      next();
    };
  }

  static checkFeatureAccess(feature: keyof typeof PLANS.FREE.features) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const userPlan = PLANS[req.user.planType as PlanType];
      if (!userPlan.features[feature]) {
        return res.status(403).json({
          status: 'error',
          message: `Your current plan does not support ${feature}`,
          requiredFeature: feature,
          currentPlan: req.user.planType
        });
      }

      next();
    };
  }

  static async checkPromptLimit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userPlan = PLANS[req.user.planType as PlanType];
    if (userPlan.features.promptLimit === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Prompt limit exceeded for your plan'
      });
    }

    next();
  }
}