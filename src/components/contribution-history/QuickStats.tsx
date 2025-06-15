import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';
import { Goal, Contribution } from './types';
interface QuickStatsProps {
  goal: Goal;
  contributions: Contribution[];
}
export const QuickStats = ({
  goal,
  contributions
}: QuickStatsProps) => {
  const confirmedContributions = contributions.filter(c => c.is_confirmed);
  const totalConfirmed = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalWithInitial = totalConfirmed + (goal.initial_amount || 0);
  const overallProgressPercentage = Math.min(100, totalWithInitial / goal.target_amount * 100);
  const getProgressColorClasses = (percentage: number) => {
    if (percentage >= 75) {
      return {
        background: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-300",
        value: "text-green-900 dark:text-green-100",
        detail: "text-green-600 dark:text-green-400"
      };
    } else if (percentage >= 50) {
      return {
        background: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        value: "text-blue-900 dark:text-blue-100",
        detail: "text-blue-600 dark:text-blue-400"
      };
    } else {
      return {
        background: "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-700 dark:text-yellow-300",
        value: "text-yellow-900 dark:text-yellow-100",
        detail: "text-yellow-600 dark:text-yellow-400"
      };
    }
  };
  const progressColors = getProgressColorClasses(overallProgressPercentage);
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Saved Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">Total Saved</p>
        </div>
        <p className="text-2xl font-bold text-green-900 dark:text-green-100 text-left">
          {formatCurrency(totalWithInitial)}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 text-left">
          Including {formatCurrency(goal.initial_amount || 0)} initial
        </p>
      </div>
      
      {/* Monthly Contributions Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Monthly Contributions</p>
        </div>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 text-left">
          {formatCurrency(totalConfirmed)}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {confirmedContributions.length} confirmed
        </p>
      </div>
      
      {/* Progress Card */}
      <div className={cn("p-4 rounded-lg border", progressColors.background, progressColors.border)}>
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4" style={{
          color: progressColors.text.includes('green') ? '#16a34a' : progressColors.text.includes('blue') ? '#2563eb' : '#ca8a04'
        }} />
          <p className={cn("text-sm font-medium", progressColors.text)}>
            Overall Progress
          </p>
        </div>
        <p className={cn("text-2xl font-bold", progressColors.value)}>
          {Math.round(overallProgressPercentage)}%
        </p>
        <p className={cn("text-xs", progressColors.detail)}>
          {formatCurrency(totalWithInitial)} of {formatCurrency(goal.target_amount)}
        </p>
      </div>
    </div>;
};