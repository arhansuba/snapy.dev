// src/api/middleware/validation/schemas.ts
import { z } from 'zod';
import { PlanType } from '../../../services/payment/plans';

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    name: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

// Project Schemas
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Project name is required')
      .max(100, 'Project name cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9-_\s]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    files: z.record(z.any())
  })
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID')
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Project name is required')
      .max(100, 'Project name cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9-_\s]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores')
      .optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    files: z.record(z.any()).optional()
  })
});

// AI Generation Schemas
export const generateCodeSchema = z.object({
  body: z.object({
    prompt: z.string()
      .min(1, 'Prompt is required')
      .max(1000, 'Prompt cannot exceed 1000 characters'),
    type: z.enum(['component', 'page', 'api', 'function'], {
      errorMap: () => ({ message: 'Invalid generation type' })
    }),
    framework: z.enum(['react', 'vue', 'angular'], {
      errorMap: () => ({ message: 'Invalid framework' })
    }).optional(),
    styling: z.enum(['tailwind', 'css', 'scss'], {
      errorMap: () => ({ message: 'Invalid styling option' })
    }).optional()
  })
});

// Payment Schemas
export const createSubscriptionSchema = z.object({
  body: z.object({
    planType: z.nativeEnum(PlanType, {
      errorMap: () => ({ message: 'Invalid plan type' })
    }),
    paymentMethodId: z.string().min(1, 'Payment method is required')
  })
});

// User Profile Schemas
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .optional(),
    email: z.string().email('Invalid email format').optional()
  })
});