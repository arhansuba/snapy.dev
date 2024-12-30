import { PlanType } from "./payment";

export type AuthProvider = "email" | "google" | "github" | "metamask" | "walletconnect";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  planType: PlanType;
  walletAddress?: string;  // For Web3 auth
  ensName?: string;       // Ethereum Name Service
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

export interface Web3LoginCredentials {
  address: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

// Auth context types
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithWeb3: (credentials: Web3LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Session storage types
export interface StoredAuth {
  token: string;
  user: AuthUser;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

// Web3 specific types
export interface Web3AuthConfig {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  blockExplorerUrl: string;
}

export interface Web3Provider {
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

// Auth middleware types
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  token?: string;
}

// OAuth types
export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: AuthProvider;
}

export interface TokenPayload {
  userId: string;
  email: string;
  planType: PlanType;
  walletAddress?: string;
  iat?: number;
  exp?: number;
}

// Constants
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

// Role-based access control types
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium'
}

export interface RolePermissions {
  [UserRole.USER]: string[];
  [UserRole.ADMIN]: string[];
  [UserRole.PREMIUM]: string[];
}

// Audit types for tracking auth events
export interface AuthEvent {
  userId: string;
  eventType: 'login' | 'logout' | 'signup' | 'password_reset' | 'web3_login';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  provider?: AuthProvider;
}