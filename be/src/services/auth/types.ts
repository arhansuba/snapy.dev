import { PlanType } from '../../db/models/types';

// src/services/auth/types.ts
export interface AuthTokenPayload {
    userId: string;
    email: string;
    planType: PlanType;
    name?: string; // Ensure name is string | undefined
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    email: string;
    password: string;
    name?: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
      planType: string;
    };
  }
  
  export class AuthError extends Error {
    constructor(message: string, public statusCode: number = 401) {
      super(message);
      this.name = 'AuthError';
    }
  }