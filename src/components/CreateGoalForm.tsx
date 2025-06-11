
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateGoalFormProps {
  onSubmit: (goalData: GoalFormData) => void;
  onCancel: () => void;
  initialData?: Partial<GoalFormData>;
  isEditing?: boolean;
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
}

export const CreateGoalForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isEditing = false 
}: CreateGoalFormProps) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData.name || '',
    targetAmount: initialData.targetAmount || 0,
    targetDate: initialData.targetDate || '',
    initialAmount: initialData.initialAmount || 0,
    monthlyPledge: initialData.monthlyPledge || 0,
    expectedReturnRate: initialData.expectedReturnRate || 5,
  });

  const [errors, setErrors] = useState<Partial<GoalFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<GoalFormData> = {};

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

    if (formData.initialAmount < 0) {
      newErrors.initialAmount = 'Initial amount cannot be negative';
    }

    if (formData.monthlyPledge <= 0) {
      newErrors.monthlyPledge = 'Monthly pledge must be greater than 0';
    }

    if (formData.expectedReturnRate < 0 || formData.expectedReturnRate > 100) {
      newErrors.expectedReturnRate = 'Return rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof GoalFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const calculateProjectedCompletion = () => {
    if (formData.targetAmount > 0 && formData.monthlyPledge > 0) {
      const remaining = formData.targetAmount - formData.initialAmount;
      const monthsNeeded = Math.ceil(remaining / formData.monthlyPledge);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);
      return projectedDate.toLocaleDateString();
    }
    return 'Unable to calculate';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </CardTitle>
          <CardDescription>
            Set up your financial goal with target amount, timeline, and contribution plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="10000"
                min="1"
                step="0.01"
                value={formData.targetAmount || ''}
                onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                className={cn(errors.targetAmount && "border-red-500")}
              />
              {errors.targetAmount && (
                <p className="text-sm text-red-600">{errors.targetAmount}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <div className="relative">
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  className={cn(errors.targetDate && "border-red-500")}
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.targetDate && (
                <p className="text-sm text-red-600">{errors.targetDate}</p>
              )}
            </div>

            {/* Initial Amount */}
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Initial Amount (Starting Balance)</Label>
              <Input
                id="initialAmount"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.initialAmount || ''}
                onChange={(e) => handleInputChange('initialAmount', parseFloat(e.target.value) || 0)}
                className={cn(errors.initialAmount && "border-red-500")}
              />
              {errors.initialAmount && (
                <p className="text-sm text-red-600">{errors.initialAmount}</p>
              )}
            </div>

            {/* Monthly Pledge */}
            <div className="space-y-2">
              <Label htmlFor="monthlyPledge">Monthly Pledge Amount</Label>
              <Input
                id="monthlyPledge"
                type="number"
                placeholder="500"
                min="1"
                step="0.01"
                value={formData.monthlyPledge || ''}
                onChange={(e) => handleInputChange('monthlyPledge', parseFloat(e.target.value) || 0)}
                className={cn(errors.monthlyPledge && "border-red-500")}
              />
              {errors.monthlyPledge && (
                <p className="text-sm text-red-600">{errors.monthlyPledge}</p>
              )}
            </div>

            {/* Expected Return Rate */}
            <div className="space-y-2">
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input
                id="expectedReturnRate"
                type="number"
                placeholder="5"
                min="0"
                max="100"
                step="0.1"
                value={formData.expectedReturnRate || ''}
                onChange={(e) => handleInputChange('expectedReturnRate', parseFloat(e.target.value) || 0)}
                className={cn(errors.expectedReturnRate && "border-red-500")}
              />
              {errors.expectedReturnRate && (
                <p className="text-sm text-red-600">{errors.expectedReturnRate}</p>
              )}
              <p className="text-sm text-gray-600">
                Default is 5%. This is used for compound interest calculations.
              </p>
            </div>

            {/* Projection Summary */}
            {formData.targetAmount > 0 && formData.monthlyPledge > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Quick Projection</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Starting amount:</span>
                    <span className="font-medium">{formatCurrency(formData.initialAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly contribution:</span>
                    <span className="font-medium">{formatCurrency(formData.monthlyPledge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated completion:</span>
                    <span className="font-medium">{calculateProjectedCompletion()}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  * This is a simplified calculation. Actual projections include compound interest.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
