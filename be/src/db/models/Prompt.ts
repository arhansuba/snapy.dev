// src/db/models/PromptUsageModel.ts
import { PrismaClient } from '@prisma/client';
import { PromptUsage } from '@prisma/client';
import { CreatePromptUsageRequest, DatabaseError } from './types';
import { getPrismaClient } from '../connection';

export class PromptUsageModel {
  private static prisma = getPrismaClient();

  static async create(userId: string, data: CreatePromptUsageRequest): Promise<PromptUsage> {
    try {
      return await this.prisma.promptUsage.create({
        data: {
          ...data,
          userId, 
        },
      });
    } catch (error) {
      throw new DatabaseError('Error creating prompt usage');
    }
  }

  static async getUserDailyUsage(userId: string, date: Date = new Date()): Promise<number> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await this.prisma.promptUsage.count({
        where: {
          userId,
          usedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error getting user daily usage');
    }
  }

  static async getUserUsageStats(userId: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await this.prisma.promptUsage.groupBy({
        by: ['usedAt'],
        where: {
          userId,
          usedAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          tokens: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error getting usage stats');
    }
  }
}