// src/api/routes/payment.ts
import { Router } from 'express';
import { StripeService } from '../../services/payment/stripe.service';
import { validate } from '../middleware/validation/validator';
import { createSubscriptionSchema } from '../middleware/validation/schemas';
import { PLANS, PlanType } from '../../services/payment/plans';

const router = Router();

router.get('/plans', (req, res) => {
  res.json(PLANS);
});

router.post('/create-checkout-session', async (req, res, next) => {
  try {
    const { planType } = req.body;
    const userId = req.user!.id;

    const baseUrl = process.env.FRONTEND_URL!;
    const sessionId = await StripeService.createCheckoutSession(
      userId,
      planType as PlanType,
      `${baseUrl}/payment/success`,
      `${baseUrl}/payment/cancel`
    );

    res.json({ sessionId });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/create-subscription',
  validate(createSubscriptionSchema),
  async (req, res, next) => {
    try {
      const { planType, paymentMethodId } = req.body;
      const userId = req.user!.id;

      const subscription = await StripeService.createSubscription(
        userId,
        planType,
        paymentMethodId
      );

      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature']!;
    await StripeService.handleWebhook(signature, req.body);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;