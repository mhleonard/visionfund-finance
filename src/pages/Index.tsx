
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Target, TrendingUp, Calendar } from 'lucide-react';
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

// Mock data for demonstration
const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    targetDate: '2025-12-31',
    initialAmount: 1000,
    monthlyPledge: 500,
    expectedReturnRate: 5,
    currentTotal: 3250,
    progressPercentage: 32.5,
    onTrackStatus: 'on-track',
    projectedCompletionDate: '2025-11-15'
  },
  {
    id: '2',
    name: 'Dream Vacation',
    targetAmount: 5000,
    targetDate: '2025-08-01',
    initialAmount: 500,
    monthlyPledge: 400,
    expectedReturnRate: 5,
    currentTotal: 1200,
    progressPercentage: 24,
    onTrackStatus: 'behind',
    projectedCompletionDate: '2025-09-15'
  },
  {
    id: '3',
    name: 'New Car Down Payment',
    targetAmount: 8000,
    targetDate: '2026-03-01',
    initialAmount: 2000,
    monthlyPledge: 300,
    expectedReturnRate: 5,
    currentTotal: 2450,
    progressPercentage: 30.6,
    onTrackStatus: 'ahead',
    projectedCompletionDate: '2025-12-01'
  }
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
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status: Goal['onTrackStatus']) => {
  switch (status) {
    case 'on-track':
      return 'text-green-600 bg-green-50';
    case 'ahead':
      return 'text-blue-600 bg-blue-50';
    case 'behind':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
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

const Index = () => {
  const [goals] = useState<Goal[]>(mockGoals);

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.currentTotal, 0);
  const overallProgress = (totalCurrentValue / totalGoalsValue) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
              <Button variant="outline" size="sm">
                Profile
              </Button>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Track your financial goals and watch your dreams become reality.</p>
        </div>

        {/* Overall Progress Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Overall Progress</CardTitle>
            <CardDescription className="text-blue-100">
              Your journey to financial freedom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
                  <p className="text-sm text-blue-100">of {formatCurrency(totalGoalsValue)} total</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{Math.round(overallProgress)}%</p>
                  <p className="text-sm text-blue-100">Complete</p>
                </div>
              </div>
              <Progress value={overallProgress} className="bg-blue-500/30 [&>div]:bg-white" />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Goal
          </Button>
          <Button variant="outline" className="flex-1 h-12">
            <TrendingUp className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{goal.name}</CardTitle>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(goal.onTrackStatus)
                  )}>
                    {getStatusText(goal.onTrackStatus)}
                  </span>
                </div>
                <CardDescription>
                  Target: {formatCurrency(goal.targetAmount)}
                </CardDescription>
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
                    <span className="text-sm text-gray-600">Monthly Pledge</span>
                    <span className="text-sm font-medium">{formatCurrency(goal.monthlyPledge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target Date</span>
                    <span className="text-sm font-medium">{formatDate(goal.targetDate)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-1 h-4 w-4" />
                    Projected: {formatDate(goal.projectedCompletionDate)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-6">
                Start your financial journey by creating your first goal.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
