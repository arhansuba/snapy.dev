// src/db/models/UserModel.ts
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import { PlanType, CreateUserRequest, UpdateUserRequest, DatabaseError } from './types';
import { getPrismaClient } from '../connection';

export class UserModel {
  private static prisma = getPrismaClient();

  static async create(data: CreateUserRequest): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          planType: PlanType.FREE,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DatabaseError('Email already registered');
      }
      throw new DatabaseError('Error creating user');
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          promptUsage: true,
          projects: true,
          payments: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user');
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user');
    }
  }

  static async update(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseError('Error updating user');
    }
  }

  static async updatePlan(userId: string, planType: PlanType): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { planType },
      });
    } catch (error) {
      throw new DatabaseError('Error updating user plan');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError('Error deleting user');
    }
  }
}