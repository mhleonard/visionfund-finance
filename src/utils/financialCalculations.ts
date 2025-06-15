/**
 * Calculate future value using compound interest formula
 * FV = PV * (1 + r)^n
 */
const calculateFutureValue = (presentValue: number, rate: number, periods: number): number =>
  rate === 0 ? presentValue : presentValue * Math.pow(1 + rate, periods);

/**
 * Calculate future value of annuity (series of payments)
 * FVA = PMT * [((1 + r)^n - 1) / r]
 */
const calculateAnnuityFutureValue = (payment: number, rate: number, periods: number): number =>
  rate === 0 ? payment * periods : payment * ((Math.pow(1 + rate, periods) - 1) / rate);

/**
 * Calculate payment using standard PMT formula
 * PMT = (FV - PV * (1 + r)^n) / [((1 + r)^n - 1) / r]
 */
const calculatePayment = (
  futureValue: number,
  presentValue: number,
  rate: number,
  periods: number
): number => {
  if (periods <= 0) return 0;
  
  const futureValueOfInitial = calculateFutureValue(presentValue, rate, periods);
  const remainingNeeded = futureValue - futureValueOfInitial;
  
  if (remainingNeeded <= 0) return 0;
  
  return rate === 0 
    ? remainingNeeded / periods
    : remainingNeeded / ((Math.pow(1 + rate, periods) - 1) / rate);
};

/**
 * Calculate number of periods using NPER formula for annuities
 * NPER = ln((PMT + FV * r) / (PMT + PV * r)) / ln(1 + r)
 */
const calculatePeriods = (
  rate: number,
  payment: number,
  presentValue: number,
  futureValue: number
): number => {
  if (payment <= 0) {
    if (rate === 0) return Infinity;
    if (presentValue <= 0) return Infinity;
    return Math.log(futureValue / presentValue) / Math.log(1 + rate);
  }
  
  if (rate === 0) return (futureValue - presentValue) / payment;
  
  const numeratorArg = (payment + futureValue * rate) / (payment + presentValue * rate);
  if (numeratorArg <= 0) return Infinity;
  
  return Math.log(numeratorArg) / Math.log(1 + rate);
};

/**
 * Get the start date for contributions (next month from goal creation)
 */
export const getContributionStartDate = (goalCreatedAt: string): Date => {
  const createdDate = new Date(goalCreatedAt);
  return new Date(createdDate.getFullYear(), createdDate.getMonth() + 1, 1);
};

/**
 * Calculate number of contribution periods from start date to target date
 */
const calculateContributionPeriods = (contributionStartDate: Date, targetDate: Date): number => {
  const startYear = contributionStartDate.getFullYear();
  const startMonth = contributionStartDate.getMonth();
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
  let periods = (targetYear - startYear) * 12 + (targetMonth - startMonth);
  
  if (targetDate.getDate() >= 1) {
    periods += 1;
  }
  
  return Math.max(1, periods);
};

/**
 * Calculate months between two dates for interest compounding
 */
const calculateMonthsBetweenDates = (startDate: Date, endDate: Date): number => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();
  
  let totalMonths = yearDiff * 12 + monthDiff;
  
  if (dayDiff > 0) {
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    totalMonths += dayDiff / daysInMonth;
  }
  
  return Math.max(0, totalMonths);
};

/**
 * Calculate the monthly payment needed to reach a target amount
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
  return Math.max(0, Math.ceil(payment * 100) / 100);
};

/**
 * Calculate when the goal will be completed
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
  
  if (initialAmount >= targetAmount) {
    return new Date();
  }

  if (monthlyContribution <= 0 && monthlyRate === 0) {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100);
  }

  const periods = calculatePeriods(monthlyRate, monthlyContribution, initialAmount, targetAmount);
  
  if (!isFinite(periods) || periods > 1200) {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100);
  }
  
  const completionDate = new Date(contributionStartDate);
  completionDate.setMonth(completionDate.getMonth() + Math.ceil(periods));
  return completionDate;
};

/**
 * Calculate current total amount including compound interest
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
  
  const sortedContributions = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const firstEventDate = sortedContributions.length > 0 ? sortedContributions[0].date : asOfDate;
  const monthsToFirstEvent = calculateMonthsBetweenDates(goalStartDate, firstEventDate);
  total = calculateFutureValue(total, monthlyRate, monthsToFirstEvent);
  
  for (let i = 0; i < sortedContributions.length; i++) {
    const contribution = sortedContributions[i];
    total += contribution.amount;
    
    const nextDate = i < sortedContributions.length - 1 
      ? sortedContributions[i + 1].date 
      : asOfDate;
    
    const monthsToNext = calculateMonthsBetweenDates(contribution.date, nextDate);
    
    if (monthsToNext > 0) {
      total = calculateFutureValue(total, monthlyRate, monthsToNext);
    }
  }
  
  return Math.round(total * 100) / 100;
};

/**
 * Calculate projected total at target date
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
  
  const goalStartDate = new Date(goalCreatedAt);
  const monthsToContributionStart = calculateMonthsBetweenDates(goalStartDate, contributionStartDate);
  
  const initialAmountAtContributionStart = calculateFutureValue(initialAmount, monthlyRate, monthsToContributionStart);
  const futureValueOfInitial = calculateFutureValue(initialAmountAtContributionStart, monthlyRate, periods);
  const futureValueOfContributions = calculateAnnuityFutureValue(monthlyContribution, monthlyRate, periods);
  
  return Math.round((futureValueOfInitial + futureValueOfContributions) * 100) / 100;
};

/**
 * Calculate projected interest earned
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
