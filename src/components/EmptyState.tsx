
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onCreateGoal: () => void;
}

export const EmptyState = ({ onCreateGoal }: EmptyStateProps) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Target className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start your financial journey by creating your first goal.
        </p>
        <Button 
          onClick={onCreateGoal}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Your First Goal
        </Button>
      </CardContent>
    </Card>
  );
};
