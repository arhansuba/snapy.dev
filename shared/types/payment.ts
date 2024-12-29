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
    // Add other plan configurations...
  };