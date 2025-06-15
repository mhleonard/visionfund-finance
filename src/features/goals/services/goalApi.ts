
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Goal, GoalInsert, GoalUpdate } from '../types';

export const fetchGoalsFromDb = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createGoalInDb = async (
  goalData: Omit<GoalInsert, 'user_id'>,
  user: User
): Promise<Goal> => {
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

  return data;
};

export const updateGoalInDb = async (
  id: string,
  updates: GoalUpdate,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};

export const deleteGoalFromDb = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};
