
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { calculateGoalMetrics } from '@/services/goalCalculations';
import { 
  fetchGoalsFromDb, 
  createGoalInDb, 
  updateGoalInDb, 
  deleteGoalFromDb 
} from '@/services/goalApi';
import type { GoalWithCalculations, GoalInsert, GoalUpdate } from '@/types/goal';

export { type GoalWithCalculations } from '@/types/goal';

export const useGoals = () => {
  const [goals, setGoals] = useState<GoalWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchGoalsFromDb(user.id);
      const goalsWithCalculations = data.map(calculateGoalMetrics);
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
      const data = await createGoalInDb(goalData, user);
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
      await updateGoalInDb(id, updates, user.id);
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
      await deleteGoalFromDb(id, user.id);
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
