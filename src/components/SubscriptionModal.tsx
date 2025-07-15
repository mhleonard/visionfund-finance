import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  showUpgrade?: boolean;
}

export const SubscriptionModal = ({ isOpen, onClose, showUpgrade = false }: SubscriptionModalProps) => {
  const { subscriptionTier, createCheckout, openCustomerPortal, cancelSubscription } = useSubscription();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleUpgrade = async () => {
    await createCheckout();
    onClose();
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
    onClose();
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    await cancelSubscription();
    setCancelling(false);
    setShowCancelConfirm(false);
    onClose();
  };

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      tier: 'basic' as const,
      features: [
        'Up to 5 active goals',
        'Goal tracking & progress',
        'Contribution history',
        'Basic analytics'
      ],
      limitations: [
        'Limited to 5 active goals'
      ]
    },
    {
      name: 'Premium',
      price: '$1/month',
      tier: 'premium' as const,
      features: [
        'Unlimited active goals',
        'Goal tracking & progress',
        'Contribution history',
        'Advanced analytics',
        'Supporting small creators'
      ],
      limitations: []
    }
  ];

  if (showCancelConfirm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to cancel your Premium subscription? You'll lose access to unlimited goals and revert to the Basic plan (5 goals maximum).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Premium
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-left">
            {showUpgrade 
              ? "You've reached the 5 goal limit for Basic users. Upgrade to Premium for unlimited goals."
              : "Compare plans and manage your subscription"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {plans.map((plan) => (
            <div 
              key={plan.tier}
              className={`relative border rounded-lg p-4 ${
                subscriptionTier === plan.tier 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              {subscriptionTier === plan.tier && (
                <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              )}
              
              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary">{plan.price}</p>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-left">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="text-left">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          {subscriptionTier === 'basic' ? (
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to Premium
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                className="flex-1"
              >
                Manage Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};