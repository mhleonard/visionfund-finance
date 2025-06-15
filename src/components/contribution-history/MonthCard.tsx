
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/financialCalculations';
import { cn } from '@/lib/utils';
import { MonthlyData, Goal } from './types';
import { getStatusIcon, getStatusColor, getStatusText } from './utils';

interface MonthCardProps {
  month: MonthlyData;
  goal: Goal;
}

export const MonthCard = ({ month, goal }: MonthCardProps) => {
  const completionPercentage = month.pledgedAmount > 0 
    ? Math.min(100, (month.actualAmount / month.pledgedAmount) * 100)
    : 0;
  
  const targetProgressPercentage = goal.target_amount > 0 
    ? (month.actualAmount / goal.target_amount) * 100 
    : 0;

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border hover:shadow-md transition-all duration-200",
        month.isInitialAmount 
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl" role="img" aria-label={getStatusText(month.status)}>
            {getStatusIcon(month.status)}
          </span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {month.isInitialAmount ? 'Initial Deposit' : month.monthDisplay}
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
            {Math.round(targetProgressPercentage * 100) / 100}% of target
          </p>
        </div>
      </div>

      {!month.isInitialAmount && month.status !== 'future' && (
        <div className="space-y-2">
          <Progress 
            value={Math.max(0, Math.min(100, completionPercentage))} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{Math.round(completionPercentage)}% of pledge</span>
            {month.contributions && month.contributions.length > 0 && (
              <span>{month.contributions.length} contribution(s)</span>
            )}
          </div>
        </div>
      )}

      {/* Show date for initial deposit */}
      {month.isInitialAmount && goal.created_at && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Initial Contribution:</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(goal.created_at).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Initial Amount
                </span>
                <span className="font-medium">
                  {formatCurrency(month.actualAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {month.contributions && month.contributions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Individual Contributions:</p>
          <div className="space-y-1">
            {month.contributions.map((contribution) => (
              <div key={contribution.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(contribution.contribution_date).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs",
                    contribution.is_confirmed 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                  )}>
                    {contribution.is_confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(contribution.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
