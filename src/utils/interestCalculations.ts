
/**
 * Interest and projection calculation utilities
 */

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

  // Track the scenario where we need to calculate interest
  let currentAmount = initialAmount;
  let totalContributions = initialAmount;
  let totalInterestEarned = 0;
  let months = 0;
  const maxMonths = 1200;

  console.log('Starting interest calculation:', {
    targetAmount,
    initialAmount,
    monthlyContribution,
    annualRate,
    monthlyRate
  });

  // Simulate month by month to track interest separately
  while (currentAmount < targetAmount && months < maxMonths) {
    // Calculate interest on current balance
    const monthlyInterest = currentAmount * monthlyRate;
    totalInterestEarned += monthlyInterest;
    
    // Apply interest to current amount
    currentAmount += monthlyInterest;
    
    // Add monthly contribution
    currentAmount += monthlyContribution;
    totalContributions += monthlyContribution;
    
    months++;
    
    console.log(`Month ${months}:`, {
      monthlyInterest: monthlyInterest.toFixed(2),
      currentAmount: currentAmount.toFixed(2),
      totalInterestEarned: totalInterestEarned.toFixed(2)
    });
  }

  // If we exceeded the target, we need to adjust for the excess
  if (currentAmount > targetAmount) {
    const excessAmount = currentAmount - targetAmount;
    
    // The excess could be from interest or contribution in the final month
    const finalMonthInterest = (currentAmount - monthlyContribution) * monthlyRate;
    
    // If excess is larger than the final month's interest, reduce contributions
    if (excessAmount > finalMonthInterest) {
      totalContributions -= (excessAmount - finalMonthInterest);
    }
    
    // Reduce interest earned by the excess interest portion
    const excessInterestPortion = Math.min(excessAmount, finalMonthInterest);
    totalInterestEarned -= excessInterestPortion;
  }

  console.log('Final interest calculation:', {
    months,
    totalInterestEarned: totalInterestEarned.toFixed(2),
    totalContributions: totalContributions.toFixed(2),
    finalAmount: Math.min(currentAmount, targetAmount).toFixed(2)
  });

  return Math.max(0, Math.round(totalInterestEarned * 100) / 100);
};
