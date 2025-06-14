
/**
 * Financial calculation utilities for goal planning
 */

/**
 * Calculate the monthly payment needed to reach a target amount
 * @param targetAmount - The goal amount to reach
 * @param initialAmount - Starting amount already saved
 * @param targetDate - When you want to reach the goal
 * @param annualRate - Expected annual return rate (as percentage, e.g., 5 for 5%)
 * @returns Monthly payment needed
 */
export const calculateMonthlyPayment = (
  targetAmount: number,
  initialAmount: number,
  targetDate: Date,
  annualRate: number
): number => {
  const today = new Date();
  const monthsToTarget = Math.max(1, Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ));

  const monthlyRate = annualRate / 100 / 12;
  const futureValueOfInitial = initialAmount * Math.pow(1 + monthlyRate, monthsToTarget);
  const remainingNeeded = targetAmount - futureValueOfInitial;

  if (remainingNeeded <= 0) {
    return 0; // Initial amount already covers the target
  }

  if (monthlyRate === 0) {
    return remainingNeeded / monthsToTarget;
  }

  // PMT calculation for annuity
  const monthlyPayment = remainingNeeded / (
    (Math.pow(1 + monthlyRate, monthsToTarget) - 1) / monthlyRate
  );

  return Math.max(0, Math.round(monthlyPayment * 100) / 100);
};

/**
 * Calculate when the goal will be completed based on current contribution plan
 * @param targetAmount - The goal amount to reach
 * @param initialAmount - Starting amount
 * @param monthlyContribution - Monthly contribution amount
 * @param annualRate - Expected annual return rate (as percentage)
 * @returns Estimated completion date
 */
export const calculateCompletionDate = (
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number
): Date => {
  const monthlyRate = annualRate / 100 / 12;
  
  if (initialAmount >= targetAmount) {
    return new Date(); // Already at target
  }

  if (monthlyContribution <= 0) {
    // No contributions, just growth of initial amount
    if (monthlyRate === 0) {
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100); // 100 years in future
    }
    const monthsNeeded = Math.log(targetAmount / initialAmount) / Math.log(1 + monthlyRate);
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
    return completionDate;
  }

  let currentAmount = initialAmount;
  let months = 0;
  const maxMonths = 1200; // 100 years maximum

  while (currentAmount < targetAmount && months < maxMonths) {
    currentAmount = currentAmount * (1 + monthlyRate) + monthlyContribution;
    months++;
  }

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + months);
  return completionDate;
};

/**
 * Calculate total interest earned over the projection period
 * @param targetAmount - The goal amount to reach
 * @param initialAmount - Starting amount
 * @param monthlyContribution - Monthly contribution amount
 * @param annualRate - Expected annual return rate (as percentage)
 * @returns Total interest earned
 */
export const calculateTotalInterest = (
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number
): number => {
  const completionDate = calculateCompletionDate(targetAmount, initialAmount, monthlyContribution, annualRate);
  const today = new Date();
  const monthsToCompletion = Math.floor(
    (completionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  const totalContributions = initialAmount + (monthlyContribution * monthsToCompletion);
  const totalInterest = targetAmount - totalContributions;

  return Math.max(0, Math.round(totalInterest * 100) / 100);
};

/**
 * Calculate future value of a series of payments with compound interest
 * @param monthlyPayment - Monthly payment amount
 * @param months - Number of months
 * @param monthlyRate - Monthly interest rate (as decimal)
 * @returns Future value
 */
export const calculateFutureValue = (
  monthlyPayment: number,
  months: number,
  monthlyRate: number
): number => {
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

/**
 * Calculate the progress percentage towards a goal
 * @param currentAmount - Current saved amount
 * @param targetAmount - Target goal amount
 * @returns Progress percentage (0-100)
 */
export const calculateProgressPercentage = (
  currentAmount: number,
  targetAmount: number
): number => {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
};
