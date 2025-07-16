
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  calculateMonthlyPayment, 
  formatCurrency
} from '@/utils/financialCalculations';

interface CreateGoalFormProps {
  onSubmit: (goalData: GoalFormData) => void;
  onCancel: () => void;
  initialData?: Partial<GoalFormData>;
  isEditing?: boolean;
  activeGoalsCount?: number;
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
}

// Simple validation function
const validateGoalData = (formData: GoalFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('Goal name is required');
  }
  
  if (formData.targetAmount <= 0) {
    errors.push('Target amount must be greater than 0');
  }
  
  if (!formData.targetDate) {
    errors.push('Target date is required');
  } else {
    const targetDate = new Date(formData.targetDate);
    const today = new Date();
    if (targetDate <= today) {
      errors.push('Target date must be in the future');
    }
  }
  
  if (formData.monthlyPledge <= 0) {
    errors.push('Monthly pledge must be greater than 0');
  }
  
  if (formData.expectedReturnRate < 0 || formData.expectedReturnRate > 100) {
    errors.push('Expected return rate must be between 0 and 100');
  }
  
  return errors;
};

// Simple projection calculation
const getProjectionData = (
  targetAmount: number,
  initialAmount: number,
  monthlyPledge: number,
  targetDate: Date,
  expectedReturnRate: number
) => {
  const today = new Date();
  const monthsToTarget = Math.max(1, 
    (targetDate.getFullYear() - today.getFullYear()) * 12 + 
    (targetDate.getMonth() - today.getMonth())
  );
  
  const monthlyRate = expectedReturnRate / 100 / 12;
  let projectedAmount = initialAmount;
  
  // Simple compound calculation
  for (let i = 0; i < monthsToTarget; i++) {
    projectedAmount = projectedAmount * (1 + monthlyRate) + monthlyPledge;
  }
  
  const totalContributions = monthlyPledge * monthsToTarget;
  const totalInterest = projectedAmount - initialAmount - totalContributions;
  const isOnTrack = projectedAmount >= targetAmount;
  
  return {
    totalInterest,
    monthsToCompletion: monthsToTarget,
    estimatedCompletion: targetDate.toLocaleDateString(),
    isOnTrack
  };
};

export const CreateGoalForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isEditing = false,
  activeGoalsCount = 0
}: CreateGoalFormProps) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData.name || '',
    targetAmount: initialData.targetAmount || 0,
    targetDate: initialData.targetDate || '',
    initialAmount: initialData.initialAmount || 0,
    monthlyPledge: initialData.monthlyPledge || 0,
    expectedReturnRate: initialData.expectedReturnRate || 5,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [autoCalculatedPledge, setAutoCalculatedPledge] = useState<number | null>(null);

  // Auto-calculate monthly pledge when relevant fields change
  useEffect(() => {
    if (formData.targetAmount > 0 && formData.targetDate && formData.expectedReturnRate >= 0) {
      try {
        const targetDate = new Date(formData.targetDate);
        const today = new Date();
        
        if (targetDate > today) {
          const calculated = calculateMonthlyPayment(
            formData.targetAmount,
            formData.initialAmount,
            targetDate,
            today.toISOString(), // Fix: Pass goalCreatedAt as string
            formData.expectedReturnRate
          );
          
          setAutoCalculatedPledge(calculated);
          
          // Auto-set if user hasn't manually entered a value
          if (formData.monthlyPledge === 0 || formData.monthlyPledge === autoCalculatedPledge) {
            setFormData(prev => ({
              ...prev,
              monthlyPledge: calculated
            }));
          }
        }
      } catch (error) {
        console.error('Error calculating monthly payment:', error);
        setAutoCalculatedPledge(null);
      }
    }
  }, [formData.targetAmount, formData.targetDate, formData.initialAmount, formData.expectedReturnRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateGoalData(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof GoalFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const projectionData = formData.targetAmount > 0 && formData.monthlyPledge > 0 && formData.targetDate
    ? getProjectionData(
        formData.targetAmount,
        formData.initialAmount,
        formData.monthlyPledge,
        new Date(formData.targetDate),
        formData.expectedReturnRate
      )
    : null;

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
            {/* Display validation errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-left">Goal Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-left">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="10000"
                min="1"
                step="0.01"
                value={formData.targetAmount === 0 ? '' : formData.targetAmount.toString()}
                onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="targetDate" className="text-left">Target Date</Label>
              <div className="relative">
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-foreground/60 pointer-events-none" />
              </div>
            </div>

            {/* Initial Amount */}
            <div className="space-y-2">
              <Label htmlFor="initialAmount" className="text-left">Initial Amount (Starting Balance)</Label>
              <Input
                id="initialAmount"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.initialAmount === 0 ? '' : formData.initialAmount.toString()}
                onChange={(e) => handleInputChange('initialAmount', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Expected Return Rate */}
            <div className="space-y-2">
              <Label htmlFor="expectedReturnRate" className="text-left">Expected Annual Return Rate (%)</Label>
              <Input
                id="expectedReturnRate"
                type="number"
                placeholder="5"
                min="0"
                max="100"
                step="0.1"
                value={formData.expectedReturnRate === 0 ? '' : formData.expectedReturnRate.toString()}
                onChange={(e) => handleInputChange('expectedReturnRate', parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Default is 5%. This is used for compound interest calculations.
              </p>
            </div>

            {/* Monthly Pledge */}
            <div className="space-y-2">
              <Label htmlFor="monthlyPledge" className="text-left">
                Monthly Pledge Amount
                {autoCalculatedPledge && (
                  <span className="text-sm text-primary ml-2">
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
              />
              <p className="text-sm text-muted-foreground">
                This amount is auto-calculated based on your target. You can adjust it manually.
              </p>
            </div>

            {/* Quick Projection Card */}
            {projectionData && (
                <div className={cn(
                  "p-4 rounded-lg border",
                  projectionData.isOnTrack 
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                    : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                )}>
                <h4 className={cn(
                  "font-medium mb-3",
                  projectionData.isOnTrack ? "text-green-900 dark:text-green-100" : "text-orange-900 dark:text-orange-100"
                )}>
                  Quick Projection
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/80">Starting amount:</span>
                    <span className="font-medium text-foreground">{formatCurrency(formData.initialAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/80">Monthly contribution:</span>
                    <span className="font-medium text-foreground">{formatCurrency(formData.monthlyPledge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/80">Projected interest:</span>
                    <span className="font-medium text-foreground">{formatCurrency(projectionData.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/80">Time to completion:</span>
                    <span className="font-medium text-foreground">{projectionData.monthsToCompletion} months</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-foreground/80">Estimated completion:</span>
                    <span className={cn(
                      "font-medium",
                      projectionData.isOnTrack ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
                    )}>
                      {projectionData.estimatedCompletion}
                    </span>
                  </div>
                </div>
                <p className={cn(
                  "text-xs mt-3",
                  projectionData.isOnTrack ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
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
