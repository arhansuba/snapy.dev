// src/services/payment/plans.ts
export enum PlanType {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
  }
  
  export interface PlanFeatures {
    promptLimit: number;
    downloadEnabled: boolean;
    codeAccessEnabled: boolean;
    maxProjects: number;
    supportLevel: 'basic' | 'priority' | 'dedicated';
  }
  
  export interface Plan {
    id: string;
    name: string;
    description: string;
    priceId: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
    features: PlanFeatures;
  }
  
  export const PLANS: Record<PlanType, Plan> = {
    [PlanType.FREE]: {
      id: 'free',
      name: 'Free',
      description: 'Get started with basic features',
      priceId: '', // No price ID for free plan
      amount: 0,
      currency: 'usd',
      interval: 'month',
      features: {
        promptLimit: 5,
        downloadEnabled: false,
        codeAccessEnabled: false,
        maxProjects: 1,
        supportLevel: 'basic'
      }
    },
    [PlanType.BASIC]: {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for individual developers',
      priceId: process.env.STRIPE_BASIC_PRICE_ID!,
      amount: 500, // $5.00
      currency: 'usd',
      interval: 'month',
      features: {
        promptLimit: 50,
        downloadEnabled: true,
        codeAccessEnabled: true,
        maxProjects: 5,
        supportLevel: 'basic'
      }
    },
    [PlanType.PREMIUM]: {
      id: 'premium',
      name: 'Premium',
      description: 'Best for professional developers',
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
      amount: 23000, // $230.00
      currency: 'usd',
      interval: 'year',
      features: {
        promptLimit: -1, // unlimited
        downloadEnabled: true,
        codeAccessEnabled: true,
        maxProjects: -1, // unlimited
        supportLevel: 'priority'
      }
    },
    [PlanType.ENTERPRISE]: {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for teams',
      priceId: '', // Custom pricing
      amount: 0,
      currency: 'usd',
      interval: 'year',
      features: {
        promptLimit: -1,
        downloadEnabled: true,
        codeAccessEnabled: true,
        maxProjects: -1,
        supportLevel: 'dedicated'
      }
    }
  };