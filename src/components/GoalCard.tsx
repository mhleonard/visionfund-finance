
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Edit, Trash2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoalWithCalculations } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: GoalWithCalculations;
  onEdit?: (goal: GoalWithCalculations) => void;
  onDelete?: (goalId: string) => void;
  onClick?: (goal: GoalWithCalculations) => void;
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

const getStatusColor = (status: GoalWithCalculations['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
    case 'ahead':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    case 'behind':
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getStatusText = (status: GoalWithCalculations['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'On Track';
    case 'ahead':
      return 'Ahead of Schedule';
    case 'behind':
      return 'Behind Schedule';
    default:
      return 'Unknown';
  }
};

export const GoalCard = ({ goal, onEdit, onDelete, onClick, onFulfillPledge }: GoalCardProps) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(goal);
    }
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
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {goal.name}
            </CardTitle>
            <CardDescription>
              Target: {formatCurrency(goal.target_amount)}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium border',
              getStatusColor(goal.onTrackStatus)
            )}>
              {getStatusText(goal.onTrackStatus)}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{Math.round(goal.progressPercentage)}%</span>
          </div>
          <Progress value={goal.progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Current</span>
            <span className="text-sm font-medium">{formatCurrency(goal.current_total || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className="text-sm font-medium">
              {formatCurrency(goal.target_amount - (goal.current_total || 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monthly Pledge</span>
            <span className="text-sm font-medium">{formatCurrency(goal.monthly_pledge)}</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              Target Date
            </div>
            <span className="font-medium">{formatDate(goal.target_date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4" />
              Projected
            </div>
            <span className="font-medium">{formatDate(goal.projectedCompletionDate)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            onClick={handleFulfillPledgeClick}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            size="sm"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Fulfill Pledge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
