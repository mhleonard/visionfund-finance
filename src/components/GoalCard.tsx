
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
  currentTotal: number;
  progressPercentage: number;
  onTrackStatus: 'on-track' | 'behind' | 'ahead';
  projectedCompletionDate: string;
}

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onClick?: (goal: Goal) => void;
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

const getStatusColor = (status: Goal['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'ahead':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'behind':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusText = (status: Goal['onTrackStatus']) => {
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

export const GoalCard = ({ goal, onEdit, onDelete, onClick }: GoalCardProps) => {
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

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
              {goal.name}
            </CardTitle>
            <CardDescription>
              Target: {formatCurrency(goal.targetAmount)}
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
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium">{Math.round(goal.progressPercentage)}%</span>
          </div>
          <Progress value={goal.progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Current</span>
            <span className="text-sm font-medium">{formatCurrency(goal.currentTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className="text-sm font-medium">
              {formatCurrency(goal.targetAmount - goal.currentTotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Monthly Pledge</span>
            <span className="text-sm font-medium">{formatCurrency(goal.monthlyPledge)}</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="mr-1 h-4 w-4" />
              Target Date
            </div>
            <span className="font-medium">{formatDate(goal.targetDate)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              Projected
            </div>
            <span className="font-medium">{formatDate(goal.projectedCompletionDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
