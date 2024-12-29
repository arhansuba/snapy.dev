// src/api/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../../services/auth/types';

export interface IAppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class ErrorMiddleware {
  static handle(
    error: IAppError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
      ErrorMiddleware.sendDevError(error, res);
    } else {
      ErrorMiddleware.sendProdError(error, res);
    }
  }

  private static sendDevError(error: IAppError, res: Response) {
    res.status(error.statusCode || 500).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack
    });
  }

  private static sendProdError(error: IAppError, res: Response) {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
      res.status(error.statusCode || 500).json({
        status: error.status,
        message: error.message
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      console.error('ERROR 💥', error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }

  static notFound(req: Request, res: Response, next: NextFunction) {
    const error = new Error(`Not found - ${req.originalUrl}`) as IAppError;
    error.statusCode = 404;
    error.status = 'fail';
    next(error);
  }

  static handleValidationError(error: any) {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  }

  static handleDuplicateFieldsDB(error: any) {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  }

  static handleJWTError() {
    return new AuthError('Invalid token. Please log in again!');
  }

  static handleJWTExpiredError() {
    return new AuthError('Your token has expired! Please log in again.');
  }
}

// Helper class for creating custom errors
class AppError extends Error {
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

// Express error handling middleware
export const errorHandler = ErrorMiddleware.handle;
export const notFound = ErrorMiddleware.notFound;