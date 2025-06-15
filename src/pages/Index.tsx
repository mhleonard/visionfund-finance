
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WelcomeSection } from '@/components/WelcomeSection';
import { OverallProgressCard } from '@/components/OverallProgressCard';
import { ActionButtons } from '@/components/ActionButtons';
import { GoalsGrid } from '@/components/GoalsGrid';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { CreateGoalForm } from '@/components/CreateGoalForm';
import { FulfillPledgeDialog } from '@/components/FulfillPledgeDialog';
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
    return <LoadingState />;
  }

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + (goal.current_total || 0), 0);
  const overallProgress = totalGoalsValue > 0 ? (totalCurrentValue / totalGoalsValue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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

  const userName = user.user_metadata?.first_name || user.email;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader userName={userName} onSignOut={handleSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection userName={userName} />

        {/* Overall Progress Card */}
        {goals.length > 0 && (
          <OverallProgressCard
            totalCurrentValue={totalCurrentValue}
            totalGoalsValue={totalGoalsValue}
            overallProgress={overallProgress}
            formatCurrency={formatCurrency}
          />
        )}

        <ActionButtons onCreateGoal={() => setShowCreateForm(true)} />

        {/* Goals Grid or Empty State */}
        {goals.length > 0 ? (
          <GoalsGrid
            goals={goals}
            onEditGoal={setEditingGoal}
            onDeleteGoal={deleteGoal}
            onFulfillPledge={setFulfillPledgeGoal}
          />
        ) : (
          <EmptyState onCreateGoal={() => setShowCreateForm(true)} />
        )}
      </main>

      {/* Fulfill Pledge Dialog */}
      <FulfillPledgeDialog
        open={!!fulfillPledgeGoal}
        onOpenChange={(open) => !open && setFulfillPledgeGoal(null)}
        goalId={fulfillPledgeGoal?.id || ''}
        goalName={fulfillPledgeGoal?.name || ''}
        monthlyPledge={fulfillPledgeGoal?.monthly_pledge || 0}
        goalCreatedAt={fulfillPledgeGoal?.created_at || ''}
        contributions={[]}
        onSuccess={() => {
          refetch();
          setFulfillPledgeGoal(null);
        }}
      />
    </div>
  );
};

export default Index;
