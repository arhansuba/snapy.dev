import React from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';

const SubscriptionContext = React.createContext<ReturnType<typeof useSubscriptionStore> | null>(null);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const subscriptionStore = useSubscriptionStore();

  return (
    <SubscriptionContext.Provider value={subscriptionStore}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export { SubscriptionContext };
