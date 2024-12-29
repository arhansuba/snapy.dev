// frontend/src/store/subscriptionStore.ts
import { create } from 'zustand';
import { 
  Plan, 
  Subscription, 
  PaymentMethod,
  Invoice,
  PaymentState 
} from '../../../shared/types/payment';
import { api } from '../utils/api';

interface SubscriptionStore extends PaymentState {
  fetchPlans: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  createSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => Promise<void>;
  fetchInvoices: () => Promise<void>;
}

const initialState: PaymentState = {
  currentPlan: null,
  subscription: null,
  paymentMethods: [],
  invoices: [],
  loading: false,
  error: null,
};

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => ({
  ...initialState,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await api.getPlans();
      const subscription = await api.request<Subscription>({
        url: '/payment/subscription',
        method: 'GET',
      });

      set((state) => ({
        currentPlan: plans.find(p => p.id === subscription?.planType) || null,
        subscription,
        loading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch plans',
        loading: false 
      });
    }
  },

  fetchSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const subscription = await api.request<Subscription>({
        url: '/payment/subscription',
        method: 'GET',
      });
      set({ subscription, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        loading: false
      });
    }
  },

  createSubscription: async (planId: string) => {
    set({ loading: true, error: null });
    try {
      const subscription = await api.createSubscription(planId);
      set({ subscription, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create subscription',
        loading: false
      });
      throw error;
    }
  },

  cancelSubscription: async () => {
    set({ loading: true, error: null });
    try {
      await api.request({
        url: '/payment/cancel-subscription',
        method: 'POST',
      });
      set({ subscription: null, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        loading: false
      });
      throw error;
    }
  },

  updatePaymentMethod: async (paymentMethod: PaymentMethod) => {
    set({ loading: true, error: null });
    try {
      await api.request({
        url: '/payment/payment-method',
        method: 'PUT',
        data: paymentMethod,
      });
      set((state) => ({
        paymentMethods: state.paymentMethods.map(pm =>
          pm.id === paymentMethod.id ? paymentMethod : pm
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update payment method',
        loading: false
      });
      throw error;
    }
  },

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const invoices = await api.request<Invoice[]>({
        url: '/payment/invoices',
        method: 'GET',
      });
      set({ invoices, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        loading: false
      });
    }
  },
}));