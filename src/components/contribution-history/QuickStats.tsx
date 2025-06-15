
import { DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';
import { Goal, Contribution } from './types';

interface QuickStatsProps {
  goal: Goal;
  contributions: Contribution[];
}

export const QuickStats = ({ goal, contributions }: QuickStatsProps) => {
  const totalConfirmed = contributions.filter(c => c.is_confirmed).reduce((sum, c) => sum + c.amount, 0);
  const totalWithInitial = totalConfirmed + (goal.initial_amount || 0);
  const overallProgressPercentage = Math.min(100, (totalWithInitial / goal.target_amount) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-300">Total Saved</p>
        </div>
        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
          {formatCurrency(totalWithInitial)}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">
          Including {formatCurrency(goal.initial_amount || 0)} initial
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300">Monthly Contributions</p>
        </div>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {formatCurrency(totalConfirmed)}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {contributions.filter(c => c.is_confirmed).length} confirmed
        </p>
      </div>
      
      <div className={cn(
        "p-4 rounded-lg border",
        overallProgressPercentage >= 75
          ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
          : overallProgressPercentage >= 50
          ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
          : "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800"
      )}>
        <p className={cn(
          "text-sm mb-2",
          overallProgressPercentage >= 75 ? "text-green-700 dark:text-green-300" : 
          overallProgressPercentage >= 50 ? "text-blue-700 dark:text-blue-300" :
          "text-yellow-700 dark:text-yellow-300"
        )}>
          Overall Progress
        </p>
        <p className={cn(
          "text-2xl font-bold",
          overallProgressPercentage >= 75 ? "text-green-900 dark:text-green-100" :
          overallProgressPercentage >= 50 ? "text-blue-900 dark:text-blue-100" :
          "text-yellow-900 dark:text-yellow-100"
        )}>
          {Math.round(overallProgressPercentage)}%
        </p>
        <p className={cn(
          "text-xs",
          overallProgressPercentage >= 75 ? "text-green-600 dark:text-green-400" :
          overallProgressPercentage >= 50 ? "text-blue-600 dark:text-blue-400" :
          "text-yellow-600 dark:text-yellow-400"
        )}>
          {formatCurrency(totalWithInitial)} of {formatCurrency(goal.target_amount)}
        </p>
      </div>
    </div>
  );
};
