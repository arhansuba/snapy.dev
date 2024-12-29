// src/services/auth/auth.service.ts
import { UserModel } from '../../db/models/UserModel';
import { JWTService } from './jwt';
import { PasswordService } from './password';
import { LoginCredentials, RegisterData, AuthResponse, AuthError } from './types';
import { PlanType } from '../../db/models/types';

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(data.email);
      if (existingUser) {
        throw new AuthError('Email already registered');
      }

      // Hash password
      const hashedPassword = await PasswordService.hash(data.password);

      // Create user
      const user = await UserModel.create({
        ...data,
        password: hashedPassword,
      });

      // Generate token
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
        },
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Registration failed');
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user
      const user = await UserModel.findByEmail(credentials.email);
      if (!user) {
        throw new AuthError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(
        credentials.password,
        user.password
      );

      if (!isValidPassword) {
        throw new AuthError('Invalid credentials');
      }

      // Generate token
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
        },
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Login failed');
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const payload = JWTService.verifyToken(token);
      const user = await UserModel.findById(payload.userId);
      return !!user;
    } catch {
      return false;
    }
  }

  static async refreshToken(oldToken: string): Promise<string> {
    try {
      const payload = JWTService.verifyToken(oldToken);
      const user = await UserModel.findById(payload.userId);
      
      if (!user) {
        throw new AuthError('User not found');
      }

      return JWTService.generateToken({
        userId: user.id,
        email: user.email,
        planType: user.planType,
      });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Token refresh failed');
    }
  }

  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AuthError('User not found');
      }

      const isValidOldPassword = await PasswordService.compare(
        oldPassword,
        user.password
      );

      if (!isValidOldPassword) {
        throw new AuthError('Invalid current password');
      }

      const hashedNewPassword = await PasswordService.hash(newPassword);
      await UserModel.update(userId, { password: hashedNewPassword });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Password change failed');
    }
  }
}