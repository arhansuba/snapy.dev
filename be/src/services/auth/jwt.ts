// src/services/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { AuthTokenPayload, AuthError } from './types';

export class JWTService {
  private static readonly SECRET_KEY = process.env.JWT_SECRET_KEY!;
  private static readonly EXPIRES_IN = '7d';

  static generateToken(payload: AuthTokenPayload): string {
    try {
      return jwt.sign(payload, this.SECRET_KEY, {
        expiresIn: this.EXPIRES_IN,
      });
    } catch (error) {
      throw new AuthError('Error generating token');
    }
  }

  static verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, this.SECRET_KEY) as AuthTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token expired');
      }
      throw new AuthError('Invalid token');
    }
  }

  static decodeToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.decode(token) as AuthTokenPayload;
    } catch {
      return null;
    }
  }

  static async refreshToken(oldToken: string): Promise<string> {
    const payload = this.verifyToken(oldToken);
    return this.generateToken(payload);
  }
}