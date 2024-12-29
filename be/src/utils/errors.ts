// src/utils/errors.ts
export class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
      public status: string = 'error',
      public isOperational: boolean = true
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string, errors?: Record<string, string[]>) {
      super(message, 400, 'validation_error');
      this.errors = errors;
    }
    errors?: Record<string, string[]>;
  }
  
  export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
      super(message, 401, 'authentication_error');
    }
  }
  
  export class AuthorizationError extends AppError {
    constructor(message: string = 'Not authorized') {
      super(message, 403, 'authorization_error');
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
      super(`${resource} not found`, 404, 'not_found_error');
    }
  }
  
  export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
      super(message, 429, 'rate_limit_error');
    }
  }
  
  // Error handler utility
  export const handleError = (error: Error) => {
    logger.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  
    if (error instanceof AppError && error.isOperational) {
      return {
        status: error.status,
        message: error.message,
        ...(error instanceof ValidationError && { errors: error.errors }),
      };
    }
  
    // For unknown errors in production
    if (process.env.NODE_ENV === 'production') {
      return {
        status: 'error',
        message: 'Something went wrong',
      };
    }
  
    return {
      status: 'error',
      message: error.message,
      stack: error.stack,
    };
  };