/**
 * Payment calculation utilities
 */

import { calculateCompletionDate } from './dateCalculations';

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
