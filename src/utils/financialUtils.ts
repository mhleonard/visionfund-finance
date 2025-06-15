
/**
 * Comprehensive financial calculation utilities for VisionFund
 * Handles goal planning, payment calculations, and projections
 */

// Type definitions for better type safety
export interface PaymentCalculationParams {
  targetAmount: number;
  initialAmount: number;
  targetDate: Date;
  annualRate: number;
}

export interface CompletionCalculationParams {
  targetAmount: number;
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
}

export interface ProjectionData {
  estimatedCompletion: string;
  totalInterest: number;
  isOnTrack: boolean;
  monthsToCompletion: number;
}

// Validation helpers
const validatePositiveNumber = (value: number, name: string): void => {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    throw new Error(`${name} must be a valid positive number`);
  }
};

const validateDate = (date: Date, name: string): void => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error(`${name} must be a valid date`);
  }
  if (date <= new Date()) {
    throw new Error(`${name} must be in the future`);
  }
};

/**
 * Calculate months between two dates with proper handling
 */
const calculateMonthsBetween = (startDate: Date, endDate: Date): number => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();
  
  let totalMonths = yearDiff * 12 + monthDiff;
  
  // Adjust for partial months
  if (dayDiff > 0) {
    totalMonths += dayDiff / 30.44; // Average days per month
  }
  
  return Math.max(1, totalMonths);
};

/**
 * Calculate the monthly payment needed to reach a target amount
 * Uses proper financial PMT formula with validation and rounding
 */
export const calculateMonthlyPayment = (params: PaymentCalculationParams): number => {
  const { targetAmount, initialAmount, targetDate, annualRate } = params;
  
  // Input validation
  validatePositiveNumber(targetAmount, 'Target amount');
  validatePositiveNumber(initialAmount, 'Initial amount');
  validatePositiveNumber(annualRate, 'Annual rate');
  validateDate(targetDate, 'Target date');
  
  const today = new Date();
  const monthsToTarget = calculateMonthsBetween(today, targetDate);
  const monthlyRate = annualRate / 100 / 12;
  
  // Calculate future value of initial amount
  const futureValueOfInitial = initialAmount * Math.pow(1 + monthlyRate, monthsToTarget);
  const remainingNeeded = targetAmount - futureValueOfInitial;

  if (remainingNeeded <= 0) {
    return 0; // Initial amount already covers the target
  }

  let calculatedPayment: number;

  if (monthlyRate === 0) {
    // No interest case
    calculatedPayment = remainingNeeded / monthsToTarget;
  } else {
    // PMT calculation for annuity
    calculatedPayment = remainingNeeded / (
      (Math.pow(1 + monthlyRate, monthsToTarget) - 1) / monthlyRate
    );
  }

  // Round up to nearest dollar
  let roundedPayment = Math.ceil(calculatedPayment);

  // Verify that this payment will complete on or before target date
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  while (attempts < maxAttempts) {
    const completionDate = calculateCompletionDate({
      targetAmount,
      initialAmount,
      monthlyContribution: roundedPayment,
      annualRate
    });

    if (completionDate <= targetDate) {
      break;
    }

    roundedPayment += 1;
    attempts++;
  }

  return Math.max(0, roundedPayment);
};

/**
 * Calculate when the goal will be completed based on current contribution plan
 */
export const calculateCompletionDate = (params: CompletionCalculationParams): Date => {
  const { targetAmount, initialAmount, monthlyContribution, annualRate } = params;
  
  // Input validation
  validatePositiveNumber(targetAmount, 'Target amount');
  validatePositiveNumber(initialAmount, 'Initial amount');
  validatePositiveNumber(monthlyContribution, 'Monthly contribution');
  validatePositiveNumber(annualRate, 'Annual rate');
  
  const monthlyRate = annualRate / 100 / 12;
  
  if (initialAmount >= targetAmount) {
    return new Date(); // Already at target
  }

  if (monthlyContribution <= 0) {
    // No contributions, just growth of initial amount
    if (monthlyRate === 0) {
      // No growth possible
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100); // 100 years in future
    }
    
    const monthsNeeded = Math.log(targetAmount / initialAmount) / Math.log(1 + monthlyRate);
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
    return completionDate;
  }

  // Iterative calculation for compound interest with regular payments
  let months = 0;
  let currentAmount = initialAmount;
  const maxMonths = 1200; // 100 years maximum

  while (currentAmount < targetAmount && months < maxMonths) {
    // Apply interest first, then add contribution
    currentAmount = currentAmount * (1 + monthlyRate) + monthlyContribution;
    months++;
  }

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + months);
  return completionDate;
};

/**
 * Calculate total interest earned over the projection period
 * Uses month-by-month simulation for accuracy
 */
export const calculateTotalInterest = (params: CompletionCalculationParams): number => {
  const { targetAmount, initialAmount, monthlyContribution, annualRate } = params;
  
  // Input validation
  validatePositiveNumber(targetAmount, 'Target amount');
  validatePositiveNumber(initialAmount, 'Initial amount');
  validatePositiveNumber(monthlyContribution, 'Monthly contribution');
  validatePositiveNumber(annualRate, 'Annual rate');
  
  const monthlyRate = annualRate / 100 / 12;
  
  if (initialAmount >= targetAmount) {
    return 0;
  }

  // Simulate month-by-month growth
  let currentAmount = initialAmount;
  let months = 0;
  let totalContributions = initialAmount;
  const maxMonths = 1200;

  while (currentAmount < targetAmount && months < maxMonths) {
    // Apply interest
    const interestEarned = currentAmount * monthlyRate;
    currentAmount += interestEarned;
    
    // Add monthly contribution
    currentAmount += monthlyContribution;
    totalContributions += monthlyContribution;
    months++;
  }

  // Adjust for overshoot
  const finalAmount = Math.min(currentAmount, targetAmount);
  if (currentAmount > targetAmount) {
    const excess = currentAmount - targetAmount;
    totalContributions -= excess;
  }

  const totalInterest = finalAmount - totalContributions;
  
  console.log('Interest calculation:', {
    targetAmount,
    initialAmount,
    monthlyContribution,
    annualRate,
    months,
    finalAmount,
    totalContributions,
    totalInterest
  });

  return Math.max(0, Math.round(totalInterest * 100) / 100);
};

/**
 * Calculate future value of a series of payments with compound interest
 */
export const calculateFutureValue = (
  monthlyPayment: number,
  months: number,
  monthlyRate: number
): number => {
  validatePositiveNumber(monthlyPayment, 'Monthly payment');
  validatePositiveNumber(months, 'Months');
  validatePositiveNumber(monthlyRate, 'Monthly rate');
  
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

/**
 * Calculate the progress percentage towards a goal
 */
export const calculateProgressPercentage = (
  currentAmount: number,
  targetAmount: number
): number => {
  validatePositiveNumber(currentAmount, 'Current amount');
  validatePositiveNumber(targetAmount, 'Target amount');
  
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
};

/**
 * Get comprehensive projection data for a goal
 */
export const getProjectionData = (
  targetAmount: number,
  initialAmount: number,
  monthlyPledge: number,
  targetDate: Date,
  annualRate: number
): ProjectionData | null => {
  try {
    if (targetAmount <= 0 || monthlyPledge <= 0) {
      return null;
    }

    const estimatedCompletion = calculateCompletionDate({
      targetAmount,
      initialAmount,
      monthlyContribution: monthlyPledge,
      annualRate
    });
    
    const totalInterest = calculateTotalInterest({
      targetAmount,
      initialAmount,
      monthlyContribution: monthlyPledge,
      annualRate
    });

    const today = new Date();
    const monthsToCompletion = calculateMonthsBetween(today, estimatedCompletion);

    return {
      estimatedCompletion: estimatedCompletion.toLocaleDateString(),
      totalInterest,
      isOnTrack: estimatedCompletion <= targetDate,
      monthsToCompletion: Math.round(monthsToCompletion)
    };
  } catch (error) {
    console.error('Error calculating projection data:', error);
    return null;
  }
};

/**
 * Utility function to format currency consistently
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Validate goal form data
 */
export const validateGoalData = (data: {
  name: string;
  targetAmount: number;
  targetDate: string;
  initialAmount: number;
  monthlyPledge: number;
  expectedReturnRate: number;
}): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Goal name is required');
  }

  try {
    validatePositiveNumber(data.targetAmount, 'Target amount');
    if (data.targetAmount <= 0) {
      errors.push('Target amount must be greater than 0');
    }
  } catch (e) {
    errors.push('Target amount must be a valid number');
  }

  try {
    const targetDate = new Date(data.targetDate);
    validateDate(targetDate, 'Target date');
  } catch (e) {
    errors.push('Target date must be in the future');
  }

  if (data.initialAmount < 0) {
    errors.push('Initial amount cannot be negative');
  }

  if (data.monthlyPledge <= 0) {
    errors.push('Monthly pledge must be greater than 0');
  }

  if (data.expectedReturnRate < 0 || data.expectedReturnRate > 100) {
    errors.push('Return rate must be between 0 and 100');
  }

  return errors;
};
