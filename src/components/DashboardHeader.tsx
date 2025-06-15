
import { Button } from '@/components/ui/button';
import { Target, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  userName: string;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userName, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              VisionFund
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {userName}
            </span>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
