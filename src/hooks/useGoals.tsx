
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
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
    const progressPercentage = goal.target_amount > 0 ? 
      Math.min((goal.current_total || 0) / goal.target_amount * 100, 100) : 0;

    // Calculate projected completion date
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const remaining = goal.target_amount - (goal.current_total || 0);
    const monthsNeeded = remaining > 0 ? Math.ceil(remaining / goal.monthly_pledge) : 0;
    
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);
    
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
  };

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const goalsWithCalculations = data.map(calculateGoalMetrics);
      setGoals(goalsWithCalculations);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<GoalInsert, 'user_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          current_total: goalData.initial_amount || 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      fetchGoals(); // Refresh the goals list
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });

      fetchGoals(); // Refresh the goals list
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });

      fetchGoals(); // Refresh the goals list
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
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
