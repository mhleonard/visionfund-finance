import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  subscriptionTier: 'basic' | 'premium';
  subscriptionStatus: string;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'premium'>('basic');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!session) {
      setSubscriptionTier('basic');
      setSubscriptionStatus('active');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionTier(data.subscription_tier || 'basic');
      setSubscriptionStatus(data.subscription_status || 'active');
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionTier('basic');
      setSubscriptionStatus('active');
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelSubscription = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to cancel your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh subscription status
      await checkSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const value = {
    subscriptionTier,
    subscriptionStatus,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};