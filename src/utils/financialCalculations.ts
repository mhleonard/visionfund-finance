/**
 * Calculate future value using compound interest formula
 * FV = PV * (1 + r)^n
 * @param presentValue - Initial amount
 * @param rate - Interest rate per period (monthly rate)
 * @param periods - Number of compounding periods
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
 * Calculate future value of annuity (series of payments)
 * FVA = PMT * [((1 + r)^n - 1) / r]
 * @param payment - Payment amount per period
 * @param rate - Interest rate per period
 * @param periods - Number of payment periods
 */
const calculateAnnuityFutureValue = (
  payment: number,
  rate: number,
  periods: number
): number => {
  if (rate === 0) return payment * periods;
  return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
};

/**
 * Calculate payment using standard PMT formula
 * PMT = (FV - PV * (1 + r)^n) / [((1 + r)^n - 1) / r]
 * Where FV is target amount, PV is initial amount
 * @param futureValue - Target amount to reach
 * @param presentValue - Initial amount already saved
 * @param rate - Interest rate per period (monthly rate)
 * @param periods - Number of payment periods
 */
const calculatePayment = (
  futureValue: number,
  presentValue: number,
  rate: number,
  periods: number
): number => {
  if (periods <= 0) return 0;
  
  // Calculate future value of initial amount
  const futureValueOfInitial = calculateFutureValue(presentValue, rate, periods);
  const remainingNeeded = futureValue - futureValueOfInitial;
  
  if (remainingNeeded <= 0) return 0;
  
  // Handle zero interest rate case
  if (rate === 0) {
    return remainingNeeded / periods;
  }
  
  // Standard PMT formula for remaining amount needed
  return remainingNeeded / ((Math.pow(1 + rate, periods) - 1) / rate);
};

/**
 * Calculate number of periods using NPER formula for annuities
 * NPER = ln((PMT + FV * r) / (PMT + PV * r)) / ln(1 + r)
 * @param rate - Interest rate per period
 * @param payment - Payment amount per period
 * @param presentValue - Initial amount
 * @param futureValue - Target amount
 */
const calculatePeriods = (
  rate: number,
  payment: number,
  presentValue: number,
  futureValue: number
): number => {
  if (payment <= 0) {
    // Only growth from initial amount
    if (rate === 0) return Infinity;
    if (presentValue <= 0) return Infinity;
    return Math.log(futureValue / presentValue) / Math.log(1 + rate);
  }
  
  if (rate === 0) {
    return (futureValue - presentValue) / payment;
  }
  
  // Check for mathematical validity
  const numeratorArg = (payment + futureValue * rate) / (payment + presentValue * rate);
  if (numeratorArg <= 0) return Infinity;
  
  // NPER formula for annuities
  const numerator = Math.log(numeratorArg);
  const denominator = Math.log(1 + rate);
  
  return numerator / denominator;
};

/**
 * Get the start date for contributions (next month from goal creation)
 * This ensures user-friendly period counting
 */
export const getContributionStartDate = (goalCreatedAt: string): Date => {
  const createdDate = new Date(goalCreatedAt);
  // Start contributions on the 1st of next month
  const startDate = new Date(createdDate.getFullYear(), createdDate.getMonth() + 1, 1);
  return startDate;
};

/**
 * Calculate number of contribution periods from start date to target date
 * Uses user-friendly counting: if target is mid-month, that month still counts as a contribution period
 * @param contributionStartDate - When contributions begin
 * @param targetDate - Goal completion date
 */
const calculateContributionPeriods = (contributionStartDate: Date, targetDate: Date): number => {
  const startYear = contributionStartDate.getFullYear();
  const startMonth = contributionStartDate.getMonth();
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
  // Calculate months between start and target
  let periods = (targetYear - startYear) * 12 + (targetMonth - startMonth);
  
  // If target date is after the 1st of the month, count that month as a contribution period
  if (targetDate.getDate() >= 1) {
    periods += 1;
  }
  
  return Math.max(1, periods); // Ensure at least 1 period
};

/**
 * Calculate months between two dates for interest compounding
 * More precise than contribution periods - used for interest calculations
 */
const calculateMonthsBetweenDates = (startDate: Date, endDate: Date): number => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();
  
  let totalMonths = yearDiff * 12 + monthDiff;
  
  // Add fractional month if end date is later in the month
  if (dayDiff > 0) {
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    totalMonths += dayDiff / daysInMonth;
  }
  
  return Math.max(0, totalMonths);
};

/**
 * Calculate the monthly payment needed to reach a target amount
 * Uses corrected PMT formula and user-friendly period counting
 */
export const calculateMonthlyPayment = (
  targetAmount: number,
  initialAmount: number,
  targetDate: Date,
  goalCreatedAt: string,
  annualRate: number = 0
): number => {
  const contributionStartDate = getContributionStartDate(goalCreatedAt);
  const periods = calculateContributionPeriods(contributionStartDate, targetDate);
  const monthlyRate = annualRate / 100 / 12;
  
  const payment = calculatePayment(targetAmount, initialAmount, monthlyRate, periods);
  return Math.max(0, Math.ceil(payment * 100) / 100); // Round to nearest cent
};

/**
 * Calculate when the goal will be completed
 * Uses corrected NPER formula and realistic date projection
 */
export const calculateCompletionDate = (
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number = 0,
  goalCreatedAt: string = new Date().toISOString()
): Date => {
  const monthlyRate = annualRate / 100 / 12;
  const contributionStartDate = getContributionStartDate(goalCreatedAt);
  
  // If already at target
  if (initialAmount >= targetAmount) {
    return new Date();
  }

  // If no contributions and no growth
  if (monthlyContribution <= 0 && monthlyRate === 0) {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100); // 100 years
  }

  // Calculate periods needed
  const periods = calculatePeriods(monthlyRate, monthlyContribution, initialAmount, targetAmount);
  
  // If periods is infinite or too large, return far future date
  if (!isFinite(periods) || periods > 1200) { // 100 years
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100);
  }
  
  // Calculate completion date
  const completionDate = new Date(contributionStartDate);
  completionDate.setMonth(completionDate.getMonth() + Math.ceil(periods));
  return completionDate;
};

/**
 * Calculate current total amount including compound interest
 * @param initialAmount - Starting amount
 * @param contributions - Array of confirmed contributions with their dates
 * @param annualRate - Annual interest rate (as percentage)
 * @param goalCreatedAt - When the goal was created
 * @param asOfDate - Calculate total as of this date (default: today)
 */
export const calculateCurrentTotal = (
  initialAmount: number,
  contributions: Array<{ amount: number; date: Date }>,
  annualRate: number,
  goalCreatedAt: string,
  asOfDate: Date = new Date()
): number => {
  const monthlyRate = annualRate / 100 / 12;
  const goalStartDate = new Date(goalCreatedAt);
  let total = initialAmount;
  
  // Sort contributions by date
  const sortedContributions = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Apply interest from goal creation to first contribution (or asOfDate if no contributions)
  const firstEventDate = sortedContributions.length > 0 ? sortedContributions[0].date : asOfDate;
  const monthsToFirstEvent = calculateMonthsBetweenDates(goalStartDate, firstEventDate);
  total = calculateFutureValue(total, monthlyRate, monthsToFirstEvent);
  
  // Process each contribution and apply interest
  for (let i = 0; i < sortedContributions.length; i++) {
    const contribution = sortedContributions[i];
    total += contribution.amount;
    
    // Apply interest from this contribution to next one (or to asOfDate)
    const nextDate = i < sortedContributions.length - 1 
      ? sortedContributions[i + 1].date 
      : asOfDate;
    
    const monthsToNext = calculateMonthsBetweenDates(contribution.date, nextDate);
    
    if (monthsToNext > 0) {
      total = calculateFutureValue(total, monthlyRate, monthsToNext);
    }
  }
  
  return Math.round(total * 100) / 100; // Round to nearest cent
};

/**
 * Calculate projected total at target date
 * @param initialAmount - Starting amount
 * @param monthlyContribution - Expected monthly contribution
 * @param targetDate - When to project to
 * @param goalCreatedAt - When goal was created
 * @param annualRate - Annual interest rate
 */
export const calculateProjectedTotal = (
  initialAmount: number,
  monthlyContribution: number,
  targetDate: Date,
  goalCreatedAt: string,
  annualRate: number = 0
): number => {
  const contributionStartDate = getContributionStartDate(goalCreatedAt);
  const periods = calculateContributionPeriods(contributionStartDate, targetDate);
  const monthlyRate = annualRate / 100 / 12;
  
  // Calculate months from goal creation to contribution start for initial amount growth
  const goalStartDate = new Date(goalCreatedAt);
  const monthsToContributionStart = calculateMonthsBetweenDates(goalStartDate, contributionStartDate);
  
  // Grow initial amount to contribution start date
  const initialAmountAtContributionStart = calculateFutureValue(initialAmount, monthlyRate, monthsToContributionStart);
  
  // Future value of initial amount from contribution start to target
  const futureValueOfInitial = calculateFutureValue(initialAmountAtContributionStart, monthlyRate, periods);
  
  // Future value of annuity (monthly contributions)
  const futureValueOfContributions = calculateAnnuityFutureValue(monthlyContribution, monthlyRate, periods);
  
  return Math.round((futureValueOfInitial + futureValueOfContributions) * 100) / 100;
};

/**
 * Calculate projected interest earned
 * @param initialAmount - Starting amount
 * @param monthlyContribution - Expected monthly contribution
 * @param targetDate - When to project to
 * @param goalCreatedAt - When goal was created
 * @param annualRate - Annual interest rate
 */
export const calculateProjectedInterest = (
  initialAmount: number,
  monthlyContribution: number,
  targetDate: Date,
  goalCreatedAt: string,
  annualRate: number = 0
): number => {
  const projectedTotal = calculateProjectedTotal(initialAmount, monthlyContribution, targetDate, goalCreatedAt, annualRate);
  const contributionStartDate = getContributionStartDate(goalCreatedAt);
  const periods = calculateContributionPeriods(contributionStartDate, targetDate);
  
  const totalContributions = initialAmount + (monthlyContribution * periods);
  const interestEarned = projectedTotal - totalContributions;
  
  return Math.max(0, Math.round(interestEarned * 100) / 100);
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
