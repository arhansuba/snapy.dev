// src/db/models/types.ts
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

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name?: string;
  planType: PlanType;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId?: string;
}

export interface PromptUsageAttributes {
  id: string;
  userId: string;
  usedAt: Date;
  prompt: string;
  response: string;
  tokens: number;
}

export interface ProjectAttributes {
  id: string;
  userId: string;
  name: string;
  description?: string;
  files: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAttributes {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  planType: PlanType;
  createdAt: Date;
}

// Request/Response types
export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  planType?: PlanType;
  stripeCustomerId?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  files: Record<string, any>;
}

export interface CreatePromptUsageRequest {
  prompt: string;
  response: string;
  tokens: number;
}

export interface CreatePaymentRequest {
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  planType: PlanType;
} 

// Error types
export class DatabaseError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(field: string) {
    super(`${field} already exists`);
    this.name = 'UniqueConstraintError';
    // this.code = 'P2002'; // Prisma unique constraint error code
  }
}

// Utility types
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type WithoutId<T> = Omit<T, 'id'>;
export type CreateAttributes<T> = WithoutId<WithoutTimestamps<T>>;

// Plan specific types
export interface PlanFeatures {
  promptLimit: number;
  downloadEnabled: boolean;
  codeAccessEnabled: boolean;
  maxProjects: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

export interface Plan {
  type: PlanType;
  name: string;
  features: PlanFeatures;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

