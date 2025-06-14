/**
 * Financial calculation utilities for goal planning
 */

/**
 * Calculate the monthly payment needed to reach a target amount
 * @param targetAmount - The goal amount to reach
 * @param initialAmount - Starting amount already saved
 * @param targetDate - When you want to reach the goal
 * @param annualRate - Expected annual return rate (as percentage, e.g., 5 for 5%)
 * @returns Monthly payment needed (rounded up to nearest dollar and verified to meet target date)
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
  
  // Calculate future value of initial amount
  const futureValueOfInitial = initialAmount * Math.pow(1 + monthlyRate, monthsToTarget);
  const remainingNeeded = targetAmount - futureValueOfInitial;

  if (remainingNeeded <= 0) {
    return 0; // Initial amount already covers the target
  }

  if (monthlyRate === 0) {
    return Math.ceil(remainingNeeded / monthsToTarget);
  }

  // PMT calculation: PMT = PV * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // But we need to solve for PMT where FV = PMT * (((1 + r)^n - 1) / r)
  // So PMT = FV / (((1 + r)^n - 1) / r)
  const calculatedPayment = remainingNeeded / (
    (Math.pow(1 + monthlyRate, monthsToTarget) - 1) / monthlyRate
  );

  // Round up to the nearest dollar
  let roundedPayment = Math.ceil(calculatedPayment);

  // Verify that this rounded payment will complete on or before target date
  // If not, increment by $1 until it does
  while (roundedPayment > 0) {
    const completionDate = calculateCompletionDate(
      targetAmount,
      initialAmount,
      roundedPayment,
      annualRate
    );

    // If completion date is on or before target date, we're good
    if (completionDate <= targetDate) {
      break;
    }

    // Otherwise, increase by $1 and try again
    roundedPayment += 1;

    // Safety check to prevent infinite loop
    if (roundedPayment > remainingNeeded) {
      break;
    }
  }

  return Math.max(0, roundedPayment);
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

  // Use financial formula to calculate months needed
  if (monthlyRate === 0) {
    const monthsNeeded = (targetAmount - initialAmount) / monthlyContribution;
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
    return completionDate;
  }

  // For compound interest with regular payments
  // We need to solve: FV = PV(1+r)^n + PMT * (((1+r)^n - 1) / r)
  // This requires iterative solution or approximation
  let months = 0;
  let currentAmount = initialAmount;
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
 * Calculate total interest earned over the projection period to target completion
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
  const monthlyRate = annualRate / 100 / 12;
  
  // If already at target, no interest calculation needed
  if (initialAmount >= targetAmount) {
    return 0;
  }

  // Calculate how many months it takes to reach the target
  let currentAmount = initialAmount;
  let months = 0;
  let totalContributions = initialAmount; // Start with initial amount
  const maxMonths = 1200; // 100 years maximum

  // Simulate month by month growth until we reach target
  while (currentAmount < targetAmount && months < maxMonths) {
    // Apply monthly interest first
    currentAmount = currentAmount * (1 + monthlyRate);
    // Add monthly contribution
    currentAmount += monthlyContribution;
    totalContributions += monthlyContribution;
    months++;
  }

  // Calculate the actual target amount reached (might be slightly over due to final contribution)
  const finalAmount = Math.min(currentAmount, targetAmount);
  
  // If we went over target, adjust for the excess
  if (currentAmount > targetAmount) {
    const excessAmount = currentAmount - targetAmount;
    totalContributions -= excessAmount; // Reduce total contributions by the excess
  }

  // Total interest is the difference between final amount and total contributions
  const totalInterest = finalAmount - totalContributions;

  console.log('Interest calculation debug:', {
    targetAmount,
    initialAmount,
    monthlyContribution,
    annualRate,
    monthlyRate,
    months,
    finalAmount,
    totalContributions,
    totalInterest
  });

  // Ensure we don't return negative interest
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
