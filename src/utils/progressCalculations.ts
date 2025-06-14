
/**
 * Progress and utility calculation functions
 */

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
