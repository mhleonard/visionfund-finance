
import { calculateProgressPercentage, calculateCompletionDate, getContributionStartDate } from '@/utils/financialCalculations';
import type { Goal, GoalWithCalculations } from '../types';

export const calculateGoalMetrics = (goal: Goal): GoalWithCalculations => {
  try {
    const progressPercentage = calculateProgressPercentage(
      goal.current_total || 0,
      goal.target_amount
    );

    // Calculate projected completion date using corrected timeline
    const targetDate = new Date(goal.target_date);
    const projectedDate = calculateCompletionDate(
      goal.target_amount,
      goal.initial_amount || 0,
      goal.monthly_pledge,
      goal.expected_return_rate || 0,
      goal.created_at
    );
    
    // Determine status based on goal completion and contribution behavior
    const contributionStartDate = getContributionStartDate(goal.created_at);
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let onTrackStatus: 'on-track' | 'behind' | 'ahead' | 'completed' = 'on-track';
    
    // Check if goal is completed first
    if ((goal.current_total || 0) >= goal.target_amount) {
      onTrackStatus = 'completed';
    } else if (currentMonth < contributionStartDate) {
      // Goal created but contributions haven't started yet - should be on track
      onTrackStatus = 'on-track';
    } else {
      // Calculate expected vs actual contributions
      const monthsSinceStart = Math.max(0, 
        (today.getFullYear() - contributionStartDate.getFullYear()) * 12 + 
        (today.getMonth() - contributionStartDate.getMonth()) + 1
      );
      
      const expectedTotal = (goal.initial_amount || 0) + (goal.monthly_pledge * monthsSinceStart);
      const actualTotal = goal.current_total || 0;
      
      const tolerance = goal.monthly_pledge * 0.1; // 10% tolerance
      
      if (actualTotal >= expectedTotal + tolerance) {
        onTrackStatus = 'ahead';
      } else if (actualTotal < expectedTotal - tolerance) {
        onTrackStatus = 'behind';
      } else {
        onTrackStatus = 'on-track';
      }
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
