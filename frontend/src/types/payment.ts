// Payment plans and subscription types
export enum PlanType {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
  }
  
  export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED'
  }
  
  export interface Plan {
    id: PlanType;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    limits: {
      promptsPerDay: number;
      projectsPerMonth: number;
      tokensPerPrompt: number;
      teamMembers?: number;
      priority?: boolean;
      customModels?: boolean;
    };
    stripePriceId: string;
    recommended?: boolean;
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
    stripeCustomerId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }
  
  export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    TRIALING = 'trialing',
    UNPAID = 'unpaid'
  }
  
  // Usage tracking
  export interface Usage {
    promptsUsed: number;
    projectsCreated: number;
    tokensUsed: number;
    lastResetDate: Date;
  }
  
  export interface UsageLimits {
    promptsPerDay: number;
    projectsPerMonth: number;
    tokensPerPrompt: number;
  }
  
  // Stripe related types
  export interface StripePaymentIntent {
    clientSecret: string;
    paymentIntentId: string;
  }
  
  export interface StripeSetupIntent {
    clientSecret: string;
    setupIntentId: string;
  }
  
  export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  }
  
  // Billing and invoices
  export interface Invoice {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: 'paid' | 'open' | 'void' | 'draft';
    invoiceUrl: string;
    invoicePdf: string;
    createdAt: Date;
    dueDate: Date;
  }
  
  // API request/response types
  export interface CreateSubscriptionRequest {
    planType: PlanType;
    paymentMethodId?: string;
  }
  
  export interface UpdateSubscriptionRequest {
    planType: PlanType;
  }
  
  export interface CancelSubscriptionRequest {
    cancelAtPeriodEnd: boolean;
  }
  
  export interface PaymentResponse {
    success: boolean;
    message?: string;
    paymentId?: string;
    error?: PaymentError;
  }
  
  export interface PaymentError {
    code: string;
    message: string;
    declineCode?: string;
  }
  
  // Billing address
  export interface BillingAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  // Webhook event types
  export interface WebhookEvent {
    id: string;
    type: string;
    data: any;
    createdAt: Date;
    processedAt?: Date;
    error?: string;
  }
  
  // Price display helper types
  export interface FormattedPrice {
    amount: string;
    currency: string;
    interval?: string;
  }
  
  // Constants
  export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY || '';
  export const DEFAULT_CURRENCY = 'usd';
  export const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp'] as const;