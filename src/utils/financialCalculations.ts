
/**
 * Financial calculation utilities for VisionFund
 */

export interface FinancialProjection {
  currentTotal: number;
  progressPercentage: number;
  projectedCompletionDate: Date;
  onTrackStatus: 'on-track' | 'behind' | 'ahead';
  monthsToCompletion: number;
  projectedFinalAmount: number;
}

export interface Goal {
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
}

export interface Contribution {
  amount: number;
  date: string;
  confirmed: boolean;
}

/**
 * Calculate compound interest for a given principal, monthly contribution, annual rate, and time period
 * Formula: FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 */
export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number => {
  if (months <= 0) return principal;
  
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    // No interest case
    return principal + (monthlyContribution * months);
  }
  
  // Future value of initial principal with compound interest
  const futureValuePrincipal = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (ordinary annuity)
  const futureValueContributions = monthlyContribution * 
    (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  
  return futureValuePrincipal + futureValueContributions;
};

/**
 * Calculate current total including confirmed contributions and compound interest
 */
export const calculateCurrentTotal = (
  goal: Goal,
  contributions: Contribution[]
): number => {
  const confirmedContributions = contributions.filter(c => c.confirmed);
  const totalContributions = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  
  // Calculate months since goal creation (approximate)
  const monthsSinceStart = confirmedContributions.length;
  
  if (monthsSinceStart === 0) {
    return goal.initialAmount;
  }
  
  // Apply compound interest to initial amount + contributions
  const currentTotal = calculateCompoundInterest(
    goal.initialAmount,
    totalContributions / monthsSinceStart, // Average monthly contribution
    goal.expectedReturnRate,
    monthsSinceStart
  );
  
  return Math.max(currentTotal, goal.initialAmount + totalContributions);
};

/**
 * Calculate how many months needed to reach the target with current plan
 */
export const calculateMonthsToTarget = (
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  annualReturnRate: number
): number => {
  if (currentAmount >= targetAmount) return 0;
  if (monthlyContribution <= 0) return Infinity;
  
  const monthlyRate = annualReturnRate / 100 / 12;
  const remainingAmount = targetAmount - currentAmount;
  
  if (monthlyRate === 0) {
    // No interest case
    return Math.ceil(remainingAmount / monthlyContribution);
  }
  
  // Using the future value formula to solve for n (number of periods)
  // FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
  // This requires numerical methods or approximation
  
  // Approximation using iteration
  let months = 0;
  let amount = currentAmount;
  const maxMonths = 1000; // Safety limit
  
  while (amount < targetAmount && months < maxMonths) {
    amount = amount * (1 + monthlyRate) + monthlyContribution;
    months++;
  }
  
  return months;
};

/**
 * Generate complete financial projection for a goal
 */
export const calculateFinancialProjection = (
  goal: Goal,
  contributions: Contribution[]
): FinancialProjection => {
  const currentTotal = calculateCurrentTotal(goal, contributions);
  const progressPercentage = (currentTotal / goal.targetAmount) * 100;
  
  const monthsToCompletion = calculateMonthsToTarget(
    currentTotal,
    goal.targetAmount,
    goal.monthlyPledge,
    goal.expectedReturnRate
  );
  
  // Calculate projected completion date
  const projectedCompletionDate = new Date();
  projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + monthsToCompletion);
  
  // Calculate projected final amount at target date
  const targetDate = new Date(goal.targetDate);
  const monthsToTargetDate = Math.max(0, 
    (targetDate.getFullYear() - projectedCompletionDate.getFullYear()) * 12 + 
    (targetDate.getMonth() - projectedCompletionDate.getMonth())
  );
  
  const projectedFinalAmount = calculateCompoundInterest(
    currentTotal,
    goal.monthlyPledge,
    goal.expectedReturnRate,
    monthsToTargetDate
  );
  
  // Determine on-track status
  let onTrackStatus: 'on-track' | 'behind' | 'ahead';
  const targetDate_ms = new Date(goal.targetDate).getTime();
  const projectedDate_ms = projectedCompletionDate.getTime();
  const timeDifference = projectedDate_ms - targetDate_ms;
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
  
  if (Math.abs(daysDifference) <= 30) {
    onTrackStatus = 'on-track';
  } else if (daysDifference < -30) {
    onTrackStatus = 'ahead';
  } else {
    onTrackStatus = 'behind';
  }
  
  return {
    currentTotal,
    progressPercentage: Math.min(progressPercentage, 100),
    projectedCompletionDate,
    onTrackStatus,
    monthsToCompletion,
    projectedFinalAmount
  };
};

/**
 * Calculate required monthly contribution to meet goal by target date
 */
export const calculateRequiredMonthlyContribution = (
  currentAmount: number,
  targetAmount: number,
  monthsRemaining: number,
  annualReturnRate: number
): number => {
  if (monthsRemaining <= 0 || currentAmount >= targetAmount) return 0;
  
  const monthlyRate = annualReturnRate / 100 / 12;
  const remainingAmount = targetAmount - currentAmount;
  
  if (monthlyRate === 0) {
    return remainingAmount / monthsRemaining;
  }
  
  // PMT = (FV - PV × (1 + r)^n) / [((1 + r)^n - 1) / r]
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, monthsRemaining);
  const remainingAfterInterest = targetAmount - futureValueOfCurrent;
  const annuityFactor = (Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate;
  
  return Math.max(0, remainingAfterInterest / annuityFactor);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate interest earned over a period
 */
export const calculateInterestEarned = (
  principal: number,
  contributions: number,
  finalAmount: number
): number => {
  return Math.max(0, finalAmount - principal - contributions);
};
