
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp } from 'lucide-react';

interface ActionButtonsProps {
  onCreateGoal: () => void;
}

export const ActionButtons = ({ onCreateGoal }: ActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Button 
        onClick={onCreateGoal}
        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        Create New Goal
      </Button>
      <Button variant="outline" className="flex-1 h-12">
        <TrendingUp className="mr-2 h-5 w-5" />
        View Analytics
      </Button>
    </div>
  );
};
