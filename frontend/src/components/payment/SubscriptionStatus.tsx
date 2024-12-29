// frontend/src/components/payment/SubscriptionStatus.tsx
import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../common/Button';
import { SubscriptionStatus as Status } from '../../../shared/types/payment';

export const SubscriptionStatus: React.FC = () => {
  const {
    currentPlan,
    subscription,
    loading,
    getRemainingDays,
    isInTrial,
    cancelSubscription,
    formatPrice
  } = useSubscription();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">No Active Subscription</h3>
        <p className="mt-2 text-gray-500">
          Choose a plan to get started with our premium features.
        </p>
        <Button
          href="/pricing"
          className="mt-4"
        >
          View Plans
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (subscription.status) {
      case Status.ACTIVE:
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="mr-1 h-4 w-4" />
            Active
          </span>
        );
      case Status.TRIALING:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            <Clock className="mr-1 h-4 w-4" />
            Trial
          </span>
        );
      case Status.PAST_DUE:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Past Due
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{currentPlan?.name} Plan</h3>
          <div className="mt-1 flex items-center gap-2">
            {getStatusBadge()}
            {subscription.cancelAtPeriodEnd && (
              <span className="text-sm text-gray-500">
                Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold">
            {formatPrice(currentPlan?.prices[0]?.amount || 0)}
          </p>
          <p className="text-sm text-gray-500">
            per {currentPlan?.prices[0]?.interval}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Billing period</span>
          <span>
            {new Date(subscription.currentPeriodStart).toLocaleDateString()} -
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>

        {isInTrial() && (
          <div className="flex justify-between text-sm">
            <span>Trial ends in</span>
            <span>{getRemainingDays()} days</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          href="/billing/update"
          variant="outline"
        >
          Change Plan
        </Button>
        {!subscription.cancelAtPeriodEnd && (
          <Button
            variant="destructive"
            onClick={cancelSubscription}
          >
            Cancel Subscription
          </Button>
        )}
      </div>
    </div>
  );
};