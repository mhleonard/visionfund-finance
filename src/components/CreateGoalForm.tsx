
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateMonthlyPayment, calculateCompletionDate, calculateTotalInterest } from '@/utils/financialCalculations';

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

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});
  const [autoCalculatedPledge, setAutoCalculatedPledge] = useState<number | null>(null);

  // Auto-calculate monthly pledge when target amount, date, initial amount, or return rate changes
  useEffect(() => {
    if (formData.targetAmount > 0 && formData.targetDate && formData.expectedReturnRate >= 0) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      
      if (targetDate > today) {
        const calculated = calculateMonthlyPayment(
          formData.targetAmount,
          formData.initialAmount,
          targetDate,
          formData.expectedReturnRate
        );
        
        setAutoCalculatedPledge(calculated);
        
        // Only auto-set if user hasn't manually entered a value
        if (formData.monthlyPledge === 0 || formData.monthlyPledge === autoCalculatedPledge) {
          setFormData(prev => ({
            ...prev,
            monthlyPledge: calculated
          }));
        }
      }
    }
  }, [formData.targetAmount, formData.targetDate, formData.initialAmount, formData.expectedReturnRate]);

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

  const getProjectionData = () => {
    if (formData.targetAmount > 0 && formData.monthlyPledge > 0 && formData.targetDate) {
      const targetDate = new Date(formData.targetDate);
      const estimatedCompletion = calculateCompletionDate(
        formData.targetAmount,
        formData.initialAmount,
        formData.monthlyPledge,
        formData.expectedReturnRate
      );
      
      const totalInterest = calculateTotalInterest(
        formData.targetAmount,
        formData.initialAmount,
        formData.monthlyPledge,
        formData.expectedReturnRate
      );

      return {
        estimatedCompletion: estimatedCompletion.toLocaleDateString(),
        totalInterest,
        isOnTrack: estimatedCompletion <= targetDate
      };
    }
    return null;
  };

  const projectionData = getProjectionData();

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
                value={formData.targetAmount === 0 ? '' : formData.targetAmount.toString()}
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
                value={formData.initialAmount === 0 ? '' : formData.initialAmount.toString()}
                onChange={(e) => handleInputChange('initialAmount', parseFloat(e.target.value) || 0)}
                className={cn(errors.initialAmount && "border-red-500")}
              />
              {errors.initialAmount && (
                <p className="text-sm text-red-600">{errors.initialAmount}</p>
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
                value={formData.expectedReturnRate === 0 ? '' : formData.expectedReturnRate.toString()}
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

            {/* Monthly Pledge (Auto-calculated) */}
            <div className="space-y-2">
              <Label htmlFor="monthlyPledge">
                Monthly Pledge Amount
                {autoCalculatedPledge && (
                  <span className="text-sm text-blue-600 ml-2">
                    (Auto-calculated: {formatCurrency(autoCalculatedPledge)})
                  </span>
                )}
              </Label>
              <Input
                id="monthlyPledge"
                type="number"
                placeholder="500"
                min="1"
                step="0.01"
                value={formData.monthlyPledge === 0 ? '' : formData.monthlyPledge.toString()}
                onChange={(e) => handleInputChange('monthlyPledge', parseFloat(e.target.value) || 0)}
                className={cn(errors.monthlyPledge && "border-red-500")}
              />
              {errors.monthlyPledge && (
                <p className="text-sm text-red-600">{errors.monthlyPledge}</p>
              )}
              <p className="text-sm text-gray-600">
                This amount is auto-calculated based on your target. You can adjust it manually.
              </p>
            </div>

            {/* Quick Projection Card */}
            {projectionData && (
              <div className={cn(
                "p-4 rounded-lg border",
                projectionData.isOnTrack 
                  ? "bg-green-50 border-green-200" 
                  : "bg-orange-50 border-orange-200"
              )}>
                <h4 className={cn(
                  "font-medium mb-3",
                  projectionData.isOnTrack ? "text-green-900" : "text-orange-900"
                )}>
                  Quick Projection
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Starting amount:</span>
                    <span className="font-medium">{formatCurrency(formData.initialAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Monthly contribution:</span>
                    <span className="font-medium">{formatCurrency(formData.monthlyPledge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Projected interest:</span>
                    <span className="font-medium">{formatCurrency(projectionData.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700">Estimated completion:</span>
                    <span className={cn(
                      "font-medium",
                      projectionData.isOnTrack ? "text-green-700" : "text-orange-700"
                    )}>
                      {projectionData.estimatedCompletion}
                    </span>
                  </div>
                </div>
                <p className={cn(
                  "text-xs mt-3",
                  projectionData.isOnTrack ? "text-green-600" : "text-orange-600"
                )}>
                  {projectionData.isOnTrack 
                    ? "✓ On track to meet your target date!" 
                    : "⚠ May complete after your target date. Consider increasing monthly contribution."
                  }
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
