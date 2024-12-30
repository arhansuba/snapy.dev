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
    promptsPerDay: 10,
    projectsPerMonth: 3,
    tokensPerPrompt: 1000,
    maxProjects: 1,
    teamMembers: 1,
  },
  [PlanType.BASIC]: {
    promptsPerDay: 50,
    projectsPerMonth: 10,
    tokensPerPrompt: 2000,
    maxProjects: 5,
    teamMembers: 1,
  },
  [PlanType.PREMIUM]: {
    promptsPerDay: 200,
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
    description: 'For individuals and hobbyists',
    features: [
      { name: 'Basic AI Generation', included: true },
      { name: 'Community Support', included: true },
      { name: 'Basic Templates', included: true },
      { name: 'Export Projects', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Models', included: false },
    ],
    prices: [
      {
        id: 'free-monthly',
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
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
    description: 'For freelancers and small teams',
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Export Projects', included: true },
      { name: 'Advanced Templates', included: true },
      { name: 'Email Support', included: true },
      { name: 'Priority Support', included: false },
      { name: 'Custom Models', included: false },
    ],
    prices: [
      {
        id: 'basic-monthly',
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID!,
        amount: 500,
        currency: 'usd',
        interval: BillingInterval.MONTHLY,
      },
      {
        id: 'basic-yearly',
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID!,
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
    description: 'For growing businesses',
    features: [
      { name: 'Everything in Basic', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Custom Templates', included: true },
      { name: 'Team Collaboration', included: true },
      { name: 'API Access', included: true },
      { name: 'Custom Models', included: false },
    ],
    prices: [
      {
        id: 'premium-monthly',
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID!,
        amount: 2000,
        currency: 'usd',
        interval: BillingInterval.MONTHLY,
      },
      {
        id: 'premium-yearly',
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID!,
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
    description: 'For large organizations',
    features: [
      { name: 'Everything in Premium', included: true },
      { name: 'Dedicated Support', included: true },
      { name: 'Custom Integration', included: true },
      { name: 'SLA', included: true },
      { name: 'Custom Models', included: true },
      { name: 'Advanced Analytics', included: true },
    ],
    prices: [], // Custom pricing
    limits: PLAN_LIMITS[PlanType.ENTERPRISE],
  },
};

export const FREE_FEATURES = Object.values(FEATURES).filter(feature => feature.included);
export const getPlanFeatures = (planType: PlanType) => PLANS[planType].features;
export const getPlanLimits = (planType: PlanType) => PLAN_LIMITS[planType];

export { PlanType };
