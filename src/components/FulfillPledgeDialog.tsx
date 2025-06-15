
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FulfillPledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalName: string;
  monthlyPledge: number;
  onSuccess: () => void;
}

export const FulfillPledgeDialog = ({
  open,
  onOpenChange,
  goalId,
  goalName,
  monthlyPledge,
  onSuccess
}: FulfillPledgeDialogProps) => {
  const [amount, setAmount] = useState(monthlyPledge.toString());
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error: contributionError } = await supabase
        .from('contributions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount: parseFloat(amount),
          contribution_date: contributionDate,
          is_confirmed: true
        });

      if (contributionError) throw contributionError;

      toast({
        title: "Pledge Fulfilled!",
        description: `Successfully added $${amount} contribution to ${goalName}`,
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setAmount(monthlyPledge.toString());
      setContributionDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error fulfilling pledge:', error);
      toast({
        title: "Error",
        description: "Failed to fulfill pledge",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Fulfill Pledge
          </DialogTitle>
          <DialogDescription>
            Add a contribution for "{goalName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-muted-foreground">
              Monthly pledge: ${monthlyPledge.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Contribution Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={contributionDate}
                onChange={(e) => setContributionDate(e.target.value)}
                required
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isLoading ? 'Adding...' : 'Add Contribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
