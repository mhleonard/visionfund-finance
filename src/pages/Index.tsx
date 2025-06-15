
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Target, TrendingUp, LogOut } from 'lucide-react';
import { GoalCard } from '@/components/GoalCard';
import { CreateGoalForm } from '@/components/CreateGoalForm';
import { FulfillPledgeDialog } from '@/components/FulfillPledgeDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useGoals, GoalWithCalculations } from '@/hooks/useGoals';

const Index = () => {
  const { user, signOut } = useAuth();
  const { goals, loading, createGoal, updateGoal, deleteGoal, refetch } = useGoals();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithCalculations | null>(null);
  const [fulfillPledgeGoal, setFulfillPledgeGoal] = useState<GoalWithCalculations | null>(null);

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
        </div>
      </div>
    );
  }

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + (goal.current_total || 0), 0);
  const overallProgress = totalGoalsValue > 0 ? (totalCurrentValue / totalGoalsValue) * 100 : 0;

  const handleCreateGoal = async (goalData: any) => {
    await createGoal({
      name: goalData.name,
      target_amount: goalData.targetAmount,
      target_date: goalData.targetDate,
      initial_amount: goalData.initialAmount,
      monthly_pledge: goalData.monthlyPledge,
      expected_return_rate: goalData.expectedReturnRate
    });
    setShowCreateForm(false);
  };

  const handleEditGoal = async (goalData: any) => {
    if (!editingGoal) return;
    
    await updateGoal(editingGoal.id, {
      name: goalData.name,
      target_amount: goalData.targetAmount,
      target_date: goalData.targetDate,
      initial_amount: goalData.initialAmount,
      monthly_pledge: goalData.monthlyPledge,
      expected_return_rate: goalData.expectedReturnRate
    });
    setEditingGoal(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <CreateGoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (editingGoal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <CreateGoalForm
          onSubmit={handleEditGoal}
          onCancel={() => setEditingGoal(null)}
          initialData={{
            name: editingGoal.name,
            targetAmount: editingGoal.target_amount,
            targetDate: editingGoal.target_date,
            initialAmount: editingGoal.initial_amount || 0,
            monthlyPledge: editingGoal.monthly_pledge,
            expectedReturnRate: editingGoal.expected_return_rate || 5
          }}
          isEditing
        />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
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
                Welcome, {user.user_metadata?.first_name || user.email}
              </span>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your financial goals and watch your dreams become reality.</p>
        </div>

        {/* Overall Progress Card */}
        {goals.length > 0 && (
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
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
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
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onEdit={setEditingGoal}
              onDelete={deleteGoal}
              onFulfillPledge={setFulfillPledgeGoal}
            />
          ))}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start your financial journey by creating your first goal.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Fulfill Pledge Dialog */}
      <FulfillPledgeDialog
        open={!!fulfillPledgeGoal}
        onOpenChange={(open) => !open && setFulfillPledgeGoal(null)}
        goalId={fulfillPledgeGoal?.id || ''}
        goalName={fulfillPledgeGoal?.name || ''}
        monthlyPledge={fulfillPledgeGoal?.monthly_pledge || 0}
        onSuccess={() => {
          refetch();
          setFulfillPledgeGoal(null);
        }}
      />
    </div>
  );
};

export default Index;
