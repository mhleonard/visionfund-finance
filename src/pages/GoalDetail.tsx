import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ImprovedContributionHistory } from '@/features/contributions/components/ImprovedContributionHistory';
import { GoalWithCalculations } from '@/features/goals/hooks/useGoals';
import { FulfillPledgeDialog } from '@/components/FulfillPledgeDialog';

export const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [goal, setGoal] = useState<GoalWithCalculations | null>(null);
  const [contributions, setContributions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGoal = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Assuming you have a function to calculate progress and other fields
      const calculatedGoal: GoalWithCalculations = {
        ...data,
        progressPercentage: 0, // Replace with actual calculation
        onTrackStatus: 'on-track', // Replace with actual status
        projectedCompletionDate: data.target_date, // Replace with actual projection
      };

      setGoal(calculatedGoal);
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('goal_id', id)
        .order('contribution_date', { ascending: true });

      if (error) throw error;

      setContributions(data || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };

  useEffect(() => {
    fetchGoal();
    fetchContributions();
  }, [id]);

  const handleDialogSuccess = () => {
    fetchContributions();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!goal) {
    return <div>Goal not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{goal.name}</h1>

      <ImprovedContributionHistory goal={goal} contributions={contributions} />

      <div className="mt-6">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fulfill Pledge
        </button>
      </div>

      <FulfillPledgeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        goalId={goal.id}
        goalName={goal.name}
        monthlyPledge={goal.monthly_pledge}
        goalCreatedAt={goal.created_at}
        contributions={contributions}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};
