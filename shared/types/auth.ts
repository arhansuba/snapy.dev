import { PlanType } from "./payment";

// shared/types/auth.ts
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
  }
  
  export interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    planType: PlanType;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
    name?: string;
  }
  
  export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
  }
  
  export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    planType: PlanType;
    iat?: number;
    exp?: number;
  }
  
  export interface PasswordReset {
    oldPassword: string;
    newPassword: string;
  }
  
  export interface EmailVerification {
    token: string;
    email: string;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: Omit<User, 'password'> | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface AuthError {
    code: string;
    message: string;
    field?: string;
  }
  
  export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'invalid_credentials',
    EMAIL_EXISTS: 'email_exists',
    INVALID_TOKEN: 'invalid_token',
    TOKEN_EXPIRED: 'token_expired',
    WEAK_PASSWORD: 'weak_password',
    UNAUTHORIZED: 'unauthorized',
  } as const;