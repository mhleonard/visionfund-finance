
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, Calendar } from 'lucide-react';
import { FormField } from './FormField';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionModal } from '@/components/SubscriptionModal';

export interface GoalFormData {
  name: string;
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
}

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<GoalFormData>;
  isEditing?: boolean;
  activeGoalsCount?: number;
}

export const GoalForm = ({ onSubmit, onCancel, initialData = {}, isEditing = false, activeGoalsCount = 0 }: GoalFormProps) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData.name || '',
    targetAmount: initialData.targetAmount || 0,
    targetDate: initialData.targetDate || '',
    initialAmount: initialData.initialAmount || 0,
    monthlyPledge: initialData.monthlyPledge || 0,
    expectedReturnRate: initialData.expectedReturnRate || 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { subscriptionTier } = useSubscription();

  // Quick projection calculation
  const calculateProjection = () => {
    const { targetAmount, initialAmount, monthlyPledge, expectedReturnRate, targetDate } = formData;
    
    if (!targetDate || monthlyPledge <= 0) return null;
    
    const today = new Date();
    const target = new Date(targetDate);
    const monthsToTarget = Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth());
    
    const monthlyRate = expectedReturnRate / 100 / 12;
    const totalContributions = monthlyPledge * monthsToTarget;
    
    // Future value calculation with compound interest
    const futureValueInitial = initialAmount * Math.pow(1 + monthlyRate, monthsToTarget);
    const futureValueContributions = monthlyPledge * ((Math.pow(1 + monthlyRate, monthsToTarget) - 1) / monthlyRate);
    const projectedTotal = futureValueInitial + futureValueContributions;
    
    return {
      projectedTotal,
      shortfall: Math.max(0, targetAmount - projectedTotal),
      monthsToTarget,
      totalContributions
    };
  };

  const projection = calculateProjection();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }

    if (formData.monthlyPledge <= 0) {
      newErrors.monthlyPledge = 'Monthly pledge must be greater than 0';
    }

    if (formData.expectedReturnRate < 0 || formData.expectedReturnRate > 50) {
      newErrors.expectedReturnRate = 'Expected return rate must be between 0% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check subscription limit for new goals
    if (!isEditing && subscriptionTier === 'basic' && activeGoalsCount >= 5) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-left">
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </h1>
        <p className="text-muted-foreground mt-2 text-left text-sm sm:text-base">
          {isEditing ? 'Update your financial goal details' : 'Set up your financial target and savings plan'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-left text-lg sm:text-xl">Goal Details</CardTitle>
            <CardDescription className="text-left text-sm sm:text-base">
              Define your financial target and timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Goal Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Emergency Fund, New Car, Vacation"
                className="text-left w-full"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Target Amount" required error={errors.targetAmount}>
                <Input
                  type="number"
                  value={formData.targetAmount || ''}
                  onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                  placeholder="10000"
                  min="1"
                  step="0.01"
                  className="text-left w-full"
                />
              </FormField>

              <FormField label="Target Date" required error={errors.targetDate}>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-left w-full pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-left text-lg sm:text-xl">Savings Plan</CardTitle>
            <CardDescription className="text-left text-sm sm:text-base">
              Configure your initial amount and monthly contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Initial Amount" error={errors.initialAmount}>
                <Input
                  type="number"
                  value={formData.initialAmount || ''}
                  onChange={(e) => setFormData({ ...formData, initialAmount: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="text-left w-full"
                />
              </FormField>

              <FormField label="Monthly Pledge" required error={errors.monthlyPledge}>
                <Input
                  type="number"
                  value={formData.monthlyPledge || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPledge: Number(e.target.value) })}
                  placeholder="500"
                  min="1"
                  step="0.01"
                  className="text-left w-full"
                />
              </FormField>
            </div>

            <FormField label="Expected Annual Return (%)" error={errors.expectedReturnRate}>
              <Input
                type="number"
                value={formData.expectedReturnRate || ''}
                onChange={(e) => setFormData({ ...formData, expectedReturnRate: Number(e.target.value) })}
                placeholder="5"
                min="0"
                max="50"
                step="0.1"
                className="text-left w-full"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Quick Projection */}
        {projection && (
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-left text-lg sm:text-xl">
                <Calculator className="mr-2 h-5 w-5" />
                Quick Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-foreground/80 font-medium">Projected Total</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(projection.projectedTotal)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-foreground/80 font-medium">Timeline</p>
                  <p className="text-lg font-bold text-foreground">
                    {projection.monthsToTarget} months
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-foreground/80 font-medium">
                    {projection.shortfall > 0 ? 'Shortfall' : 'Surplus'}
                  </p>
                  <p className={`text-lg font-bold ${
                    projection.shortfall > 0 
                      ? 'text-destructive' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {projection.shortfall > 0 
                      ? `-${formatCurrency(projection.shortfall)}`
                      : `+${formatCurrency(projection.projectedTotal - formData.targetAmount)}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 order-1 sm:order-2"
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Goal' : 'Create Goal')}
          </Button>
        </div>
      </form>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        showUpgrade={true}
      />
    </div>
  );
};
