
/**
 * Calculate future value using compound interest formula
 * FV = PV * (1 + r)^n
 */
const calculateFutureValue = (
  presentValue: number,
  rate: number,
  periods: number
): number => {
  if (rate === 0) return presentValue;
  return presentValue * Math.pow(1 + rate, periods);
};

/**
 * Calculate payment using PMT formula
 * PMT = FV * r / ((1 + r)^n - 1)
 */
const calculatePayment = (
  futureValue: number,
  rate: number,
  periods: number
): number => {
  if (rate === 0) return futureValue / periods;
  return futureValue * rate / (Math.pow(1 + rate, periods) - 1);
};

/**
 * Calculate number of periods using NPER formula
 * NPER = ln(FV / PV) / ln(1 + r) for single payment
 * For annuity: more complex calculation
 */
const calculatePeriods = (
  rate: number,
  payment: number,
  presentValue: number,
  futureValue: number
): number => {
  if (rate === 0) {
    return (futureValue - presentValue) / payment;
  }
  
  // Using the NPER formula for annuities
  const numerator = Math.log((payment + futureValue * rate) / (payment + presentValue * rate));
  const denominator = Math.log(1 + rate);
  
  return numerator / denominator;
};

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
  const futureValueOfInitial = calculateFutureValue(initialAmount, monthlyRate, monthsToTarget);
  const remainingNeeded = targetAmount - futureValueOfInitial;

  if (remainingNeeded <= 0) return 0;

  // Calculate payment needed for remaining amount
  const payment = calculatePayment(remainingNeeded, monthlyRate, monthsToTarget);
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

  // Calculate periods needed using NPER formula
  const months = calculatePeriods(monthlyRate, monthlyContribution, initialAmount, targetAmount);
  
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
