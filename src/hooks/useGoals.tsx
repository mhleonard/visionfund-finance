
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { calculateProgressPercentage, calculateCompletionDate } from '@/utils/financialCalculations';
import type { Database } from '@/integrations/supabase/types';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export interface GoalWithCalculations extends Goal {
  progressPercentage: number;
  onTrackStatus: 'on-track' | 'behind' | 'ahead';
  projectedCompletionDate: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<GoalWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateGoalMetrics = (goal: Goal): GoalWithCalculations => {
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

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const goalsWithCalculations = (data || []).map(calculateGoalMetrics);
      setGoals(goalsWithCalculations);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch goals. Please try again.",
        variant: "destructive",
      });
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<GoalInsert, 'user_id'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create goals.",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (!goalData.name || goalData.target_amount <= 0 || goalData.monthly_pledge <= 0) {
        throw new Error('Invalid goal data provided');
      }

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          current_total: goalData.initial_amount || 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      fetchGoals();
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update goals.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });

      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete goals.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
};
