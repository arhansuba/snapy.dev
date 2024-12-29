// src/db/models/PaymentModel.ts
import { PrismaClient, Payment } from '@prisma/client';
import { CreatePaymentRequest, PaymentStatus, DatabaseError } from './types';
import { getPrismaClient } from '../connection';

export class PaymentModel {
  private static prisma = getPrismaClient();

  static async create(userId: string, data: CreatePaymentRequest): Promise<Payment> {
    try {
      return await this.prisma.payment.create({
        data: {
          ...data,
          userId,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error creating payment');
    }
  }

  static async findByStripePaymentId(stripePaymentId: string): Promise<Payment | null> {
    try {
      return await this.prisma.payment.findUnique({
        where: { stripePaymentId },
      });
    } catch (error) {
      throw new DatabaseError('Error finding payment');
    }
  }

  static async updateStatus(
    stripePaymentId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    try {
      return await this.prisma.payment.update({
        where: { stripePaymentId },
        data: { status },
      });
    } catch (error) {
      throw new DatabaseError('Error updating payment status');
    }
  }

  static async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      return await this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Error getting user payments');
    }
  }

  static async getUserActiveSubscription(userId: string): Promise<Payment | null> {
    try {
      return await this.prisma.payment.findFirst({
        where: {
          userId,
          status: PaymentStatus.SUCCEEDED,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new DatabaseError('Error getting user subscription');
    }
  }
}