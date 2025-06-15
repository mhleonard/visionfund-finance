
import { GoalCard } from './GoalCard';
import { GoalWithCalculations } from '../hooks/useGoals';

interface GoalsGridProps {
  goals: GoalWithCalculations[];
  onEditGoal: (goal: GoalWithCalculations) => void;
  onDeleteGoal: (goalId: string) => void;
  onFulfillPledge: (goal: GoalWithCalculations) => void;
}

export const GoalsGrid = ({ 
  goals, 
  onEditGoal, 
  onDeleteGoal, 
  onFulfillPledge 
}: GoalsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard 
          key={goal.id} 
          goal={goal}
          onEdit={onEditGoal}
          onDelete={onDeleteGoal}
          onFulfillPledge={onFulfillPledge}
        />
      ))}
    </div>
  );
};

