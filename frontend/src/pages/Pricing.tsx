// frontend/src/pages/Pricing.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, HelpCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { PLANS, PlanType } from '../../../shared/constants/plans';

export const Pricing: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { isAuthenticated, user } = useAuth();
  const { currentPlan, subscribe, loading } = useSubscription();
  const navigate = useNavigate();

  const handleSubscribe = async (planType: PlanType) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      await subscribe(planType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const getBillingPrice = (prices: any[]) => {
    const price = prices.find(p => p.interval === billingInterval);
    return price ? price.amount / 100 : 0;
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingInterval === 'month' ? 'text-primary' : 'text-gray-500'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(current =>
                current === 'month' ? 'year' : 'month'
              )}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingInterval === 'year' ? 'text-primary' : 'text-gray-500'}>
              Yearly
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Object.values(PLANS).map((plan) => {
            const price = getBillingPrice(plan.prices);
            const isCurrentPlan = currentPlan?.type === plan.type;

            return (
              <div
                key={plan.type}
                className={`rounded-2xl border p-8 ${
                  plan.type === PlanType.PREMIUM
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : ''
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

                <div className="mt-4 flex items-baseline">
                  {price > 0 ? (
                    <>
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-sm text-gray-500">/{billingInterval}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">Free</span>
                  )}
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 ${
                        feature.included ? 'text-green-500' : 'text-gray-300'
                      }`} />
                      <span className={feature.included ? '' : 'text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 w-full"
                  variant={plan.type === PlanType.PREMIUM ? 'default' : 'outline'}
                  disabled={isCurrentPlan || loading}
                  onClick={() => handleSubscribe(plan.type)}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Add FAQ items here */}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Need a custom solution?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact us for enterprise pricing and custom features.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/contact')}
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;