
import { Button } from '@/components/ui/button';
import { Target, LogOut, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
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
  );
};
