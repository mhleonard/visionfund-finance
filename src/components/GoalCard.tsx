
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Edit, Trash2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWithCalculations } from '@/hooks/useGoals';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getStatusText } from '@/utils/goalStatusUtils';

interface GoalCardProps {
  goal: GoalWithCalculations;
  onEdit?: (goal: GoalWithCalculations) => void;
  onDelete?: (goalId: string) => void;
  onFulfillPledge?: (goal: GoalWithCalculations) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onFulfillPledge
}: GoalCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/goals/${goal.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(goal);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(goal.id);
    }
  };

  const handleFulfillPledgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFulfillPledge) {
      onFulfillPledge(goal);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group w-full">
      <CardHeader className="pb-3 px-4 sm:px-6" onClick={handleCardClick}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-left leading-tight">
              {goal.name}
            </CardTitle>
            <CardDescription className="text-left text-xs sm:text-sm mt-1">
              Target: {formatCurrency(goal.target_amount)}
            </CardDescription>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap', getStatusColor(goal.onTrackStatus))}>
              {getStatusText(goal.onTrackStatus)}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleEditClick}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={handleDeleteClick}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6" onClick={handleCardClick}>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Progress</span>
            <span className="text-xs sm:text-sm font-medium">{Math.round(goal.progressPercentage)}%</span>
          </div>
          <Progress value={goal.progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Current</span>
            <span className="text-xs sm:text-sm font-medium">{formatCurrency(goal.current_total || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Remaining</span>
            <span className="text-xs sm:text-sm font-medium">
              {formatCurrency(goal.target_amount - (goal.current_total || 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Monthly Pledge</span>
            <span className="text-xs sm:text-sm font-medium">{formatCurrency(goal.monthly_pledge)}</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Target Date</span>
            </div>
            <span className="font-medium text-xs sm:text-sm">{formatDate(goal.target_date)}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Projected</span>
            </div>
            <span className="font-medium text-xs sm:text-sm">{formatDate(goal.projectedCompletionDate)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button 
            onClick={handleFulfillPledgeClick} 
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xs sm:text-sm" 
            size="sm"
          >
            <DollarSign className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Fulfill Pledge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
