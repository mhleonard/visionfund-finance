
/**
 * @deprecated This file is kept for backward compatibility.
 * All financial calculations have been moved to src/utils/financialUtils.ts
 * Please import from financialUtils.ts instead.
 */

// Re-export everything from the new consolidated financial utilities
export * from './financialUtils';

// Maintain backward compatibility for any existing imports
import {
  calculateMonthlyPayment as _calculateMonthlyPayment,
  calculateCompletionDate as _calculateCompletionDate,
  calculateTotalInterest as _calculateTotalInterest,
  calculateFutureValue as _calculateFutureValue,
  calculateProgressPercentage as _calculateProgressPercentage
} from './financialUtils';

export const calculateMonthlyPayment = _calculateMonthlyPayment;
export const calculateCompletionDate = _calculateCompletionDate;
export const calculateTotalInterest = _calculateTotalInterest;
export const calculateFutureValue = _calculateFutureValue;
export const calculateProgressPercentage = _calculateProgressPercentage;
