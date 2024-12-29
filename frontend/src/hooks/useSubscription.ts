// frontend/src/hooks/useSubscription.ts
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { PlanType } from '../../../shared/types/payment';
import { APP_ROUTES } from '../config/routes';

export const useSubscription = () => {
  const navigate = useNavigate();
  const {
    currentPlan,
    subscription,
    paymentMethods,
    invoices,
    loading,
    error,
    fetchPlans,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
    updatePaymentMethod,
    fetchInvoices,
  } = useSubscriptionStore();

  const [hasAccess, setHasAccess] = useState(false);

  // Fetch subscription data on mount
  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, [fetchSubscription, fetchInvoices]);

  // Check if user has access to specific plan features
  const checkPlanAccess = useCallback((requiredPlan: PlanType | PlanType[]) => {
    if (!currentPlan) return false;

    const requiredPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
    return requiredPlans.includes(currentPlan.type);
  }, [currentPlan]);

  // Handle subscription creation
  const handleSubscribe = useCallback(async (planId: string) => {
    try {
      await createSubscription(planId);
      navigate(APP_ROUTES.DASHBOARD.path);
    } catch (error) {
      // Error is handled by the store
    }
  }, [createSubscription, navigate]);

  // Handle subscription cancellation
  const handleCancelSubscription = useCallback(async () => {
    try {
      await cancelSubscription();
      navigate(APP_ROUTES.PRICING.path);
    } catch (error) {
      // Error is handled by the store
    }
  }, [cancelSubscription, navigate]);

  // Calculate remaining days in trial/subscription
  const getRemainingDays = useCallback(() => {
    if (!subscription) return 0;

    const endDate = subscription.trialEnd || subscription.currentPeriodEnd;
    if (!endDate) return 0;

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [subscription]);

  // Check if subscription is in trial period
  const isInTrial = useCallback(() => {
    if (!subscription) return false;
    
    const now = new Date();
    return (
      subscription.trialEnd &&
      new Date(subscription.trialEnd) > now
    );
  }, [subscription]);

  // Format price for display
  const formatPrice = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  }, []);

  return {
    currentPlan,
    subscription,
    paymentMethods,
    invoices,
    loading,
    error,
    hasAccess,
    checkPlanAccess,
    subscribe: handleSubscribe,
    cancelSubscription: handleCancelSubscription,
    updatePaymentMethod,
    getRemainingDays,
    isInTrial,
    formatPrice,
    fetchPlans,
    fetchSubscription,
    fetchInvoices,
  };
};

// Optional: Type guard for subscription features
export const useSubscriptionFeature = (feature: string) => {
  const { currentPlan, loading } = useSubscriptionStore();
  const [hasFeature, setHasFeature] = useState(false);

  useEffect(() => {
    if (!currentPlan || loading) {
      setHasFeature(false);
      return;
    }

    setHasFeature(
      currentPlan.features.some(f => f.id === feature && f.included)
    );
  }, [currentPlan, feature, loading]);

  return hasFeature;
};