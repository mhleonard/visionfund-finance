
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Edit,
  Plus
} from 'lucide-react';
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

interface Contribution {
  id: string;
  amount: number;
  date: string;
  confirmed: boolean;
}

interface GoalDetailsViewProps {
  goal: Goal;
  onBack: () => void;
  onEdit: () => void;
  onAddContribution: () => void;
}

// Mock contribution data
const mockContributions: Contribution[] = [
  { id: '1', amount: 500, date: '2024-01-15', confirmed: true },
  { id: '2', amount: 500, date: '2024-02-15', confirmed: true },
  { id: '3', amount: 750, date: '2024-03-15', confirmed: true },
  { id: '4', amount: 500, date: '2024-04-15', confirmed: true },
  { id: '5', amount: 500, date: '2024-05-15', confirmed: false },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusColor = (status: Goal['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ahead':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'behind':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  
  // Future value of initial amount
  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (annuity)
  const futureValueContributions = monthlyContribution * 
    (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  
  return futureValuePrincipal + futureValueContributions;
};

export const GoalDetailsView = ({ goal, onBack, onEdit, onAddContribution }: GoalDetailsViewProps) => {
  const [contributions] = useState<Contribution[]>(mockContributions);
  
  const confirmedContributions = contributions.filter(c => c.confirmed);
  const totalContributions = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  
  // Calculate months to target date
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const monthsToTarget = Math.max(0, 
    (targetDate.getFullYear() - today.getFullYear()) * 12 + 
    (targetDate.getMonth() - today.getMonth())
  );

  // Calculate projected value with compound interest
  const projectedTotal = calculateCompoundInterest(
    goal.initialAmount + totalContributions,
    goal.monthlyPledge,
    goal.expectedReturnRate,
    monthsToTarget
  );

  const willMeetGoal = projectedTotal >= goal.targetAmount;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{goal.name}</h1>
            <p className="text-gray-600">Goal Details & Progress</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Goal
          </Button>
          <Button onClick={onAddContribution} className="bg-gradient-to-r from-blue-600 to-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Contribution
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(goal.progressPercentage)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(goal.currentTotal)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(goal.targetAmount)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>Track your journey to your financial goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Goal Progress</span>
                <Badge className={cn("border", getStatusColor(goal.onTrackStatus))}>
                  {goal.onTrackStatus === 'on-track' && 'On Track'}
                  {goal.onTrackStatus === 'ahead' && 'Ahead of Schedule'}
                  {goal.onTrackStatus === 'behind' && 'Behind Schedule'}
                </Badge>
              </div>
              <Progress value={goal.progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{formatCurrency(goal.currentTotal)}</span>
                <span>{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Initial Amount</span>
                <span className="font-medium">{formatCurrency(goal.initialAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Contributions</span>
                <span className="font-medium">{formatCurrency(totalContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Interest Earned</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(goal.currentTotal - goal.initialAmount - totalContributions)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Remaining to Goal</span>
                  <span className="font-bold">{formatCurrency(goal.targetAmount - goal.currentTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Projection</CardTitle>
            <CardDescription>Projected outcome based on current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={cn(
              "p-4 rounded-lg border",
              willMeetGoal ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projected Total by Target Date</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(projectedTotal)}
                  </p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  willMeetGoal ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {willMeetGoal ? 'Goal Achievable' : 'Adjustment Needed'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Pledge</span>
                <span className="font-medium">{formatCurrency(goal.monthlyPledge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Return Rate</span>
                <span className="font-medium">{goal.expectedReturnRate}% annually</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Target Date</span>
                <span className="font-medium">{formatDate(goal.targetDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Completion</span>
                <span className="font-medium">{formatDate(goal.projectedCompletionDate)}</span>
              </div>
            </div>

            {!willMeetGoal && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Recommendation:</strong> Consider increasing your monthly contribution to 
                  {formatCurrency(Math.ceil((goal.targetAmount - projectedTotal) / monthsToTarget + goal.monthlyPledge))} 
                  to reach your goal on time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>Track your monthly contributions and confirmations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contributions.map((contribution) => (
              <div 
                key={contribution.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    contribution.confirmed ? "bg-green-500" : "bg-yellow-500"
                  )} />
                  <div>
                    <p className="font-medium">{formatDate(contribution.date)}</p>
                    <p className="text-sm text-gray-600">
                      {contribution.confirmed ? 'Confirmed' : 'Pending Confirmation'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(contribution.amount)}</p>
                  {contribution.amount !== goal.monthlyPledge && (
                    <p className="text-sm text-gray-600">
                      (Pledge: {formatCurrency(goal.monthlyPledge)})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
