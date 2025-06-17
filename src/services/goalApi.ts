
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Goal, GoalInsert, GoalUpdate } from '@/types/goal';

export const fetchGoalsFromDb = async (userId: string): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    throw error;
  }
};

export const createGoalInDb = async (
  goalData: Omit<GoalInsert, 'user_id'>,
  user: User
): Promise<Goal> => {
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
      console.error('Error creating goal:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create goal:', error);
    throw error;
  }
};

export const updateGoalInDb = async (
  id: string,
  updates: GoalUpdate,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update goal:', error);
    throw error;
  }
};

export const deleteGoalFromDb = async (id: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete goal:', error);
    throw error;
  }
};
