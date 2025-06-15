
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  target_date: string;
  initial_amount: number;
  monthly_pledge: number;
  expected_return_rate: number;
  current_total: number;
  created_at: string;
}

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  is_confirmed: boolean;
  created_at: string;
}

interface ContributionHistoryProps {
  goal: Goal;
  contributions: Contribution[];
}

interface MonthlyData {
  month: string;
  monthDisplay: string;
  pledgedAmount: number;
  actualAmount: number;
  status: 'confirmed' | 'pending' | 'missed' | 'future';
  contributions: Contribution[];
}

export const ContributionHistory = ({ goal, contributions }: ContributionHistoryProps) => {
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Generate monthly data from goal start to target date
  const monthlyData: MonthlyData[] = [];
  const startDate = new Date(goal.created_at);
  const targetDate = new Date(goal.target_date);
  const today = new Date();
  
  const currentDate = new Date(startDate);
  currentDate.setDate(1); // Start of month
  
  while (currentDate <= targetDate) {
    const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    const monthDisplay = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Find contributions for this month
    const monthContributions = contributions.filter(c => 
      c.contribution_date.slice(0, 7) === monthKey
    );
    
    const actualAmount = monthContributions.reduce((sum, c) => 
      c.is_confirmed ? sum + c.amount : sum, 0
    );
    
    const hasUnconfirmed = monthContributions.some(c => !c.is_confirmed);
    
    let status: MonthlyData['status'];
    if (currentDate > today) {
      status = 'future';
    } else if (actualAmount > 0) {
      status = hasUnconfirmed ? 'pending' : 'confirmed';
    } else {
      status = 'missed';
    }
    
    monthlyData.push({
      month: monthKey,
      monthDisplay,
      pledgedAmount: goal.monthly_pledge,
      actualAmount,
      status,
      contributions: monthContributions
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Sort by most recent first and limit display
  const sortedData = monthlyData.reverse();
  const displayData = showFullHistory ? sortedData : sortedData.slice(0, 6);

  const getStatusIcon = (status: MonthlyData['status']) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'missed':
        return '❌';
      case 'future':
        return '📅';
      default:
        return '';
    }
  };

  const getStatusColor = (status: MonthlyData['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'future':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: MonthlyData['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'missed':
        return 'Missed';
      case 'future':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  // Calculate quick stats
  const confirmedContributions = contributions.filter(c => c.is_confirmed);
  const totalConfirmed = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  const averageMonthly = confirmedContributions.length > 0 
    ? totalConfirmed / confirmedContributions.length 
    : 0;
  
  const completedMonths = monthlyData.filter(m => m.status === 'confirmed').length;
  const expectedMonths = monthlyData.filter(m => m.status !== 'future').length;
  const monthsAheadBehind = completedMonths - expectedMonths;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">Total Confirmed</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(totalConfirmed)}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">Average Monthly</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(averageMonthly)}
          </p>
        </div>
        
        <div className={cn(
          "p-4 rounded-lg border",
          monthsAheadBehind >= 0 
            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
            : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800"
        )}>
          <p className={cn(
            "text-sm",
            monthsAheadBehind >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            Schedule Status
          </p>
          <p className={cn(
            "text-2xl font-bold",
            monthsAheadBehind >= 0 ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
          )}>
            {monthsAheadBehind >= 0 ? `${monthsAheadBehind} ahead` : `${Math.abs(monthsAheadBehind)} behind`}
          </p>
        </div>
      </div>

      {/* Monthly Timeline */}
      <div className="space-y-3">
        {displayData.map((month) => {
          const completionPercentage = month.pledgedAmount > 0 
            ? Math.min(100, (month.actualAmount / month.pledgedAmount) * 100)
            : 0;

          return (
            <div 
              key={month.month}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(month.status)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {month.monthDisplay}
                    </h4>
                    <Badge className={cn("border text-xs", getStatusColor(month.status))}>
                      {getStatusText(month.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(month.actualAmount)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    of {formatCurrency(month.pledgedAmount)}
                  </p>
                </div>
              </div>

              {month.status !== 'future' && (
                <div className="space-y-2">
                  <Progress 
                    value={completionPercentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{Math.round(completionPercentage)}% of pledge</span>
                    {month.contributions.length > 0 && (
                      <span>{month.contributions.length} contribution(s)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View Full History Button */}
      {sortedData.length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="w-full sm:w-auto"
          >
            {showFullHistory ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                View Full History ({sortedData.length - 6} more months)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
