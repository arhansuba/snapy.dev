// shared/types/payment.ts
export enum PlanType {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
  }
  
  export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum BillingInterval {
    MONTHLY = 'month',
    YEARLY = 'year',
  }
  
  export interface Plan {
    id: string;
    type: PlanType;
    name: string;
    description: string;
    features: PlanFeature[];
    prices: PlanPrice[];
    limits: PlanLimits;
    metadata?: Record<string, any>;
  }
  
  export interface PlanFeature {
    id: string;
    name: string;
    description: string;
    included: boolean;
  }
  
  export interface PlanPrice {
    id: string;
    stripePriceId: string;
    amount: number;
    currency: string;
    interval: BillingInterval;
    trialDays?: number;
  }
  
  export interface PlanLimits {
    promptsPerDay: number;
    projectsPerMonth: number;
    tokensPerPrompt: number;
    maxProjects: number;
    teamMembers: number;
  }
  
  export interface Payment {
    id: string;
    userId: string;
    stripePaymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    planType: PlanType;
    createdAt: Date;
  }
  
  export interface Subscription {
    id: string;
    userId: string;
    planType: PlanType;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
    endedAt?: Date;
    trialStart?: Date;
    trialEnd?: Date;
  }
  
  export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    UNPAID = 'unpaid',
    CANCELED = 'canceled',
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    TRIALING = 'trialing'
  }
  
  export interface SubscriptionUpdateParams {
    planType: PlanType;
    priceId: string;
    cancelAtPeriodEnd?: boolean;
  }
  
  export interface PaymentMethod {
    id: string;
    type: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  }
  
  export interface Invoice {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paidAt?: Date;
    dueDate: Date;
    items: InvoiceItem[];
  }
  
  export interface InvoiceItem {
    description: string;
    amount: number;
    quantity: number;
  }
  
  export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    clientSecret: string;
  }
  
  export interface PaymentState {
    currentPlan: Plan | null;
    subscription: Subscription | null;
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
    loading: boolean;
    error: string | null;
  }
  
  export const PAYMENT_ERRORS = {
    PAYMENT_FAILED: 'payment_failed',
    INVALID_CARD: 'invalid_card',
    CARD_DECLINED: 'card_declined',
    INSUFFICIENT_FUNDS: 'insufficient_funds',
    SUBSCRIPTION_ERROR: 'subscription_error',
  } as const;
  
  // Default plan configurations
  export const DEFAULT_PLANS: Record<PlanType, Omit<Plan, 'id' | 'prices'>> = {
    [PlanType.FREE]: {
      type: PlanType.FREE,
      name: 'Free',
      description: 'Get started with basic features',
      features: [
        { id: '1', name: 'Basic AI Generation', description: 'Generate simple components', included: true },
        { id: '2', name: 'Preview Generated Apps', description: 'Preview before download', included: true },
        { id: '3', name: 'Community Support', description: 'Access to community forums', included: true },
      ],
      limits: {
        promptsPerDay: 5,
        projectsPerMonth: 2,
        tokensPerPrompt: 1000,
        maxProjects: 1,
        teamMembers: 1,
      }
    },
    [PlanType.BASIC]: {
      type: PlanType.BASIC,
      name: 'Basic',
      description: 'Basic plan with more features',
      features: [
        { id: '1', name: 'Basic AI Generation', description: 'Generate simple components', included: true },
        { id: '2', name: 'Preview Generated Apps', description: 'Preview before download', included: true },
        { id: '3', name: 'Email Support', description: 'Access to email support', included: true },
      ],
      limits: {
        promptsPerDay: 10,
        projectsPerMonth: 5,
        tokensPerPrompt: 2000,
        maxProjects: 3,
        teamMembers: 3,
      }
    },
    [PlanType.PREMIUM]: {
      type: PlanType.PREMIUM,
      name: 'Premium',
      description: 'Premium plan with advanced features',
      features: [
        { id: '1', name: 'Advanced AI Generation', description: 'Generate advanced components', included: true },
        { id: '2', name: 'Priority Support', description: 'Access to priority support', included: true },
        { id: '3', name: 'Unlimited Projects', description: 'Create unlimited projects', included: true },
      ],
      limits: {
        promptsPerDay: 50,
        projectsPerMonth: 20,
        tokensPerPrompt: 5000,
        maxProjects: 10,
        teamMembers: 10,
      }
    },
    [PlanType.ENTERPRISE]: {
      type: PlanType.ENTERPRISE,
      name: 'Enterprise',
      description: 'Enterprise plan with all features',
      features: [
        { id: '1', name: 'Custom AI Generation', description: 'Generate custom components', included: true },
        { id: '2', name: 'Dedicated Support', description: 'Access to dedicated support', included: true },
        { id: '3', name: 'Unlimited Everything', description: 'Unlimited usage of all features', included: true },
      ],
      limits: {
        promptsPerDay: 100,
        projectsPerMonth: 50,
        tokensPerPrompt: 10000,
        maxProjects: 50,
        teamMembers: 50,
      }
    }
  };