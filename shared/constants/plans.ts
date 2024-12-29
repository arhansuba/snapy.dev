// shared/constants/plans.ts
import { Plan, PlanType, BillingInterval, PlanFeature, PlanLimits } from '../types/payment';

export const FEATURES: Record<string, PlanFeature> = {
  AI_GENERATION: {
    id: 'ai-generation',
    name: 'AI Code Generation',
    description: 'Generate code using AI',
    included: true,
  },
  CUSTOM_COMPONENTS: {
    id: 'custom-components',
    name: 'Custom Components',
    description: 'Create and save custom components',
    included: true,
  },
  EXPORT_CODE: {
    id: 'export-code',
    name: 'Export Code',
    description: 'Download generated code',
    included: true,
  },
  TEAM_COLLABORATION: {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    description: 'Work together with team members',
    included: false,
  },
  PRIORITY_SUPPORT: {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority support',
    included: false,
  },
  CUSTOM_DEPLOYMENT: {
    id: 'custom-deployment',
    name: 'Custom Deployment',
    description: 'Deploy to custom domains',
    included: false,
  },
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    promptsPerDay: 5,
    projectsPerMonth: 2,
    tokensPerPrompt: 1000,
    maxProjects: 1,
    teamMembers: 1,
  },
  [PlanType.BASIC]: {
    promptsPerDay: 20,
    projectsPerMonth: 10,
    tokensPerPrompt: 2000,
    maxProjects: 5,
    teamMembers: 1,
  },
  [PlanType.PREMIUM]: {
    promptsPerDay: 100,
    projectsPerMonth: 50,
    tokensPerPrompt: 4000,
    maxProjects: 20,
    teamMembers: 5,
  },
  [PlanType.ENTERPRISE]: {
    promptsPerDay: -1, // unlimited
    projectsPerMonth: -1,
    tokensPerPrompt: 8000,
    maxProjects: -1,
    teamMembers: -1,
  },
};

export const PLANS: Record<PlanType, Plan> = {
  [PlanType.FREE]: {
    id: 'free',
    type: PlanType.FREE,
    name: 'Free',
    description: 'Perfect for trying out the platform',
    features: [
      FEATURES.AI_GENERATION,
      { ...FEATURES.CUSTOM_COMPONENTS, included: false },
      { ...FEATURES.EXPORT_CODE, included: false },
    ],
    prices: [
      {
        id: 'free-monthly',
        stripePriceId: '',
        amount: 0,
        currency: 'usd',
        interval: BillingInterval.MONTHLY,
      }
    ],
    limits: PLAN_LIMITS[PlanType.FREE],
  },
  [PlanType.BASIC]: {
    id: 'basic',
    type: PlanType.BASIC,
    name: 'Basic',
    description: 'Great for individual developers',
    features: [
      FEATURES.AI_GENERATION,
      FEATURES.CUSTOM_COMPONENTS,
      FEATURES.EXPORT_CODE,
    ],
    prices: [
      {
        id: 'basic-monthly',
        stripePriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
        amount: 500,
        currency: 'usd',
        interval: BillingInterval.MONTHLY,
      },
      {
        id: 'basic-yearly',
        stripePriceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID!,
        amount: 5000,
        currency: 'usd',
        interval: BillingInterval.YEARLY,
      }
    ],
    limits: PLAN_LIMITS[PlanType.BASIC],
  },
  [PlanType.PREMIUM]: {
    id: 'premium',
    type: PlanType.PREMIUM,
    name: 'Premium',
    description: 'Best for professional developers',
    features: [
      FEATURES.AI_GENERATION,
      FEATURES.CUSTOM_COMPONENTS,
      FEATURES.EXPORT_CODE,
      FEATURES.TEAM_COLLABORATION,
      FEATURES.PRIORITY_SUPPORT,
    ],
    prices: [
      {
        id: 'premium-monthly',
        stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
        amount: 2000,
        currency: 'usd',
        interval: BillingInterval.MONTHLY,
      },
      {
        id: 'premium-yearly',
        stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
        amount: 20000,
        currency: 'usd',
        interval: BillingInterval.YEARLY,
      }
    ],
    limits: PLAN_LIMITS[PlanType.PREMIUM],
  },
  [PlanType.ENTERPRISE]: {
    id: 'enterprise',
    type: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Custom solutions for teams',
    features: Object.values(FEATURES).map(feature => ({ ...feature, included: true })),
    prices: [], // Custom pricing
    limits: PLAN_LIMITS[PlanType.ENTERPRISE],
  },
};

export const FREE_FEATURES = Object.values(FEATURES).filter(feature => feature.included);
export const getPlanFeatures = (planType: PlanType) => PLANS[planType].features;
export const getPlanLimits = (planType: PlanType) => PLAN_LIMITS[planType];

export { PlanType };
