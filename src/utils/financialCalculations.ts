
import { pv, fv, pmt, nper } from 'financial';

/**
 * Calculate the monthly payment needed to reach a target amount
 */
export const calculateMonthlyPayment = (
  targetAmount: number,
  initialAmount: number,
  targetDate: Date,
  annualRate: number = 0
): number => {
  const today = new Date();
  const monthsToTarget = Math.max(1, 
    (targetDate.getFullYear() - today.getFullYear()) * 12 + 
    (targetDate.getMonth() - today.getMonth())
  );
  
  const monthlyRate = annualRate / 100 / 12;
  const futureValueOfInitial = fv(monthlyRate, monthsToTarget, 0, -initialAmount);
  const remainingNeeded = targetAmount - futureValueOfInitial;

  if (remainingNeeded <= 0) return 0;

  // Use PMT function to calculate payment
  const payment = -pmt(monthlyRate, monthsToTarget, 0, remainingNeeded);
  return Math.max(0, Math.ceil(payment));
};

/**
 * Calculate when the goal will be completed
 */
export const calculateCompletionDate = (
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number = 0
): Date => {
  const monthlyRate = annualRate / 100 / 12;
  
  if (initialAmount >= targetAmount) {
    return new Date();
  }

  if (monthlyContribution <= 0) {
    // Only growth from initial amount
    if (monthlyRate === 0) {
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100); // 100 years
    }
    const months = Math.log(targetAmount / initialAmount) / Math.log(1 + monthlyRate);
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + months);
    return completionDate;
  }

  // Use NPER function to calculate periods needed
  const months = nper(monthlyRate, -monthlyContribution, -initialAmount, targetAmount);
  
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + Math.ceil(months));
  return completionDate;
};

/**
 * Calculate the progress percentage towards a goal
 */
export const calculateProgressPercentage = (
  currentAmount: number,
  targetAmount: number
): number => {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
};

/**
 * Format currency consistently
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
