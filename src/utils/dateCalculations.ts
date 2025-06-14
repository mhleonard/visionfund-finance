
/**
 * Date and completion calculation utilities
 */

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
