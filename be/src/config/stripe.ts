// src/config/stripe.ts
interface StripeConfig {
    secretKey: string;
    publicKey: string;
    webhookSecret: string;
    apiVersion: string;
    prices: {
      basic: string;
      premium: string;
    };
    currency: string;
  }
  
  const config: StripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2023-10-16',
    prices: {
      basic: process.env.STRIPE_BASIC_PRICE_ID || '',
      premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    },
    currency: 'usd',
  };
  
  export const getStripeConfig = () => ({
    apiVersion: config.apiVersion,
    typescript: true,
    maxNetworkRetries: 3,
    timeout: 30000,
  });
  
  export default config;