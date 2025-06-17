
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GoalForm, GoalFormData } from '@/components/forms/GoalForm';
import { LoadingState } from '@/components/LoadingState';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  target_date: string;
  initial_amount: number;
  monthly_pledge: number;
  expected_return_rate: number;
}

const EditGoal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      navigate('/');
      return;
    }
    fetchGoal();
  }, [user, id, navigate]);

  const fetchGoal = async () => {
    if (!id || !user?.id) {
      navigate('/');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching goal:', error);
        throw error;
      }
      
      if (!data) {
        toast({
          title: "Goal not found",
          description: "The goal you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setGoal(data);
    } catch (error) {
      console.error('Error fetching goal:', error);
      toast({
        title: "Error",
        description: "Failed to load goal data.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (goalData: GoalFormData) => {
    if (!goal || !user?.id) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          name: goalData.name,
          target_amount: goalData.targetAmount,
          target_date: goalData.targetDate,
          initial_amount: goalData.initialAmount,
          monthly_pledge: goalData.monthlyPledge,
          expected_return_rate: goalData.expectedReturnRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating goal:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
      
      navigate(`/goals/${goal.id}`);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/goals/${id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!goal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <GoalForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={{
          name: goal.name,
          targetAmount: goal.target_amount,
          targetDate: goal.target_date,
          initialAmount: goal.initial_amount || 0,
          monthlyPledge: goal.monthly_pledge,
          expectedReturnRate: goal.expected_return_rate || 5
        }}
        isEditing
      />
    </div>
  );
};

export default EditGoal;
