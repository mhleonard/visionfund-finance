
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, LogOut, Crown, ArrowUp } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { SubscriptionModal } from '@/components/SubscriptionModal';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  const { subscriptionTier } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  return (
    <>
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
      />
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent truncate">
              VisionFund
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:block text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-32 sm:max-w-none">
              Welcome, {userName}
            </span>
            
            {/* Subscription Indicator */}
            {subscriptionTier === 'premium' ? (
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <Crown className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Premium</span>
              </Badge>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSubscriptionModal(true)}
                className="text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowUp className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            )}
            
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSignOut}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};
