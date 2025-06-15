
import { calculateProgressPercentage, calculateCompletionDate } from '@/utils/financialCalculations';
import type { Goal, GoalWithCalculations } from '@/types/goal';

export const calculateGoalMetrics = (goal: Goal): GoalWithCalculations => {
  try {
    const progressPercentage = calculateProgressPercentage(
      goal.current_total || 0,
      goal.target_amount
    );

    // Calculate projected completion date
    const targetDate = new Date(goal.target_date);
    const projectedDate = calculateCompletionDate(
      goal.target_amount,
      goal.initial_amount || 0,
      goal.monthly_pledge,
      goal.expected_return_rate || 0
    );
    
    // Determine status
    let onTrackStatus: 'on-track' | 'behind' | 'ahead' = 'on-track';
    if (projectedDate > targetDate) {
      onTrackStatus = 'behind';
    } else if (projectedDate < targetDate && progressPercentage > 50) {
      onTrackStatus = 'ahead';
    }

    return {
      ...goal,
      progressPercentage,
      onTrackStatus,
      projectedCompletionDate: projectedDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error calculating goal metrics:', error);
    return {
      ...goal,
      progressPercentage: 0,
      onTrackStatus: 'on-track' as const,
      projectedCompletionDate: goal.target_date
    };
  }
};
