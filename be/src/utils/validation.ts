// src/utils/validation.ts
import { z } from 'zod';
import { ValidationError } from './errors';

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_-]{3,16}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Common validation schemas
export const commonSchemas = {
  email: z.string().email().regex(patterns.email, 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      patterns.password,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(patterns.username, 'Username can only contain letters, numbers, underscores, and hyphens'),
};

// Validation utilities
export class Validator {
  static async validate<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = this.formatZodError(error);
        throw new ValidationError('Validation failed', errors);
      }
      throw error;
    }
  }

  static formatZodError(error: z.ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    return errors;
  }

  static sanitize(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static isStrongPassword(password: string): boolean {
    return patterns.password.test(password);
  }

  static isValidEmail(email: string): boolean {
    return patterns.email.test(email);
  }

  static isValidUrl(url: string): boolean {
    return patterns.url.test(url);
  }
}

// Custom validation decorators (if using class-validator)
export const validateDTO = (schema: z.ZodSchema) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const data = args[0];
      await Validator.validate(schema, data);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};