// frontend/src/components/payment/PricingPlans.tsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../common/Button';
import { PLANS } from '../../../../shared/constants/plans';
import { Plan, PlanType } from '../../../../shared/types/payment';
//import { PLANS, PlanType } from '../../shared/constants/plans';

export const PricingPlans: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentPlan, subscribe, loading } = useSubscription();

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    await subscribe(planId);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-primary">
          Pricing
        </h2>
        <p className="mt-2 text-4xl font-bold tracking-tight">
          Choose the right plan for you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 mt-16 lg:grid-cols-4">
        {Object.values(PLANS).map((plan: Plan) => {
          const isCurrentPlan = currentPlan?.type === plan.type;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                plan.type === PlanType.PREMIUM ? 'bg-gray-900 text-white ring-0' : 'bg-white'
              }`}
            >
              <h3 className="text-lg font-semibold leading-8">
                {plan.name}
              </h3>

              {plan.prices[0]?.amount ? (
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ${plan.prices[0].amount / 100}
                  </span>
                  <span className="text-sm font-semibold leading-6">
                    /{plan.prices[0].interval}
                  </span>
                </p>
              ) : (
                <p className="mt-4 text-4xl font-bold tracking-tight">
                  Custom
                </p>
              )}

              <ul className="mt-8 space-y-3 text-sm leading-6">
                {plan.features.map((feature: { id: string; included: boolean; name: string }) => (
                  <li key={feature.id} className="flex gap-3">
                    {feature.included ? (
                      <Check className="h-6 w-6 text-green-500" />
                    ) : (
                      <X className="h-6 w-6 text-gray-400" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan || loading}
                className="mt-8 w-full"
                variant={plan.type === PlanType.PREMIUM ? 'default' : 'outline'}
              >
                {isCurrentPlan ? 'Current Plan' : 'Get Started'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};