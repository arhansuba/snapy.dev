// src/api/middleware/validation/validator.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../../../utils/errors';

export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class RequestValidator {
  static async validate(
    schema: AnyZodObject,
    req: Request
  ): Promise<ValidationResult> {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: this.formatZodError(error)
        };
      }
      return {
        success: false,
        error: 'Validation failed'
      };
    }
  }

  private static formatZodError(error: ZodError): string {
    return error.errors
      .map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      })
      .join(', ');
  }
}

// Middleware factory
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RequestValidator.validate(schema, req);
      if (!result.success) {
        throw new ValidationError(result.error!);
      }
      
      // Update request with validated data
      req.body = result.data?.body;
      req.query = result.data?.query;
      req.params = result.data?.params;
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
      } else {
        next(error);
      }
    }
  };
};

// Custom validators
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};