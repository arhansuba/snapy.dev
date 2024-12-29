// src/services/auth/password.ts
import bcrypt from 'bcryptjs';
import { AuthError } from './types';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_PASSWORD_LENGTH = 8;

  static async hash(password: string): Promise<string> {
    try {
      if (!this.isValidPassword(password)) {
        throw new AuthError('Invalid password format');
      }
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Error hashing password');
    }
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new AuthError('Error comparing passwords');
    }
  }

  static isValidPassword(password: string): boolean {
    // Password must be at least 8 characters long and contain:
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return (
      password.length >= this.MIN_PASSWORD_LENGTH &&
      passwordRegex.test(password)
    );
  }
}