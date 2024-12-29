// src/services/payment/stripe.service.ts
import Stripe from 'stripe';
import { PLANS, PlanType } from './plans';
import { UserModel } from '../../db/models/UserModel';
import { PaymentModel } from '../../db/models/PaymentModel';
import { PaymentStatus } from '../../db/models/types';

export class StripeService {
  private static stripe: Stripe;

  static initialize() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  static async createCustomer(userId: string, email: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata: { userId }
      });

      await UserModel.update(userId, { stripeCustomerId: customer.id });
      return customer.id;
    } catch (error) {
      throw new Error('Failed to create Stripe customer');
    }
  }

  static async createSubscription(
    userId: string,
    planType: PlanType,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      const plan = PLANS[planType];
      if (!plan.priceId) throw new Error('Invalid plan selected');

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        customerId = await this.createCustomer(userId, user.email);
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: plan.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planType
        }
      });

      return subscription;
    } catch (error) {
      throw new Error('Failed to create subscription');
    }
  }

  static async createCheckoutSession(
    userId: string,
    planType: PlanType,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      const plan = PLANS[planType];
      if (!plan.priceId) throw new Error('Invalid plan selected');

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: plan.priceId,
          quantity: 1
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: user.email,
        metadata: {
          userId,
          planType
        }
      });

      return session.id;
    } catch (error) {
      throw new Error('Failed to create checkout session');
    }
  }

  static async handleWebhook(
    signatureHeader: string,
    payload: Buffer
  ): Promise<void> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signatureHeader,
        webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const { userId, planType } = session.metadata!;
          
          await PaymentModel.create(userId, {
            stripePaymentId: session.id,
            amount: session.amount_total!,
            currency: session.currency!,
            status: PaymentStatus.SUCCEEDED,
            planType: planType as PlanType
          });

          await UserModel.updatePlan(userId, planType as PlanType);
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscription = await this.stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const { userId, planType } = subscription.metadata;
          await UserModel.updatePlan(userId, planType as PlanType);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscription = await this.stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          // Handle failed payment (e.g., notify user)
          // You might want to add email notification here
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const { userId } = subscription.metadata;
          
          // Revert to free plan
          await UserModel.updatePlan(userId, PlanType.FREE);
          break;
        }
      }
    } catch (error) {
      throw new Error('Webhook handling failed');
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      throw new Error('Failed to cancel subscription');
    }
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      throw new Error('Failed to get subscription');
    }
  }

  static async updateSubscription(
    subscriptionId: string,
    planType: PlanType
  ): Promise<Stripe.Subscription> {
    try {
      const plan = PLANS[planType];
      if (!plan.priceId) throw new Error('Invalid plan selected');

      return await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionId,
          price: plan.priceId
        }],
        metadata: {
          planType
        }
      });
    } catch (error) {
      throw new Error('Failed to update subscription');
    }
  }
}