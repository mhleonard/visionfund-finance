
import { Goal, Contribution, MonthlyData, YearGroup } from './types';
import { getContributionStartDate } from '@/utils/financialCalculations';

// Helper function to check if a contribution date falls within a specific month
export const isContributionInMonth = (contributionDate: string, year: number, month: number): boolean => {
  const contribution = new Date(contributionDate);
  return contribution.getFullYear() === year && contribution.getMonth() === month;
};

// Generate monthly data including initial amount and proper timeline
export const generateMonthlyData = (goal: Goal, contributions: Contribution[]): YearGroup[] => {
  const monthlyData: MonthlyData[] = [];
  const contributionStartDate = getContributionStartDate(goal.created_at);
  const targetDate = new Date(goal.target_date);
  const today = new Date();
  
  // Add initial amount as first entry with unique identifier
  if (goal.initial_amount > 0) {
    const goalCreatedDate = new Date(goal.created_at);
    monthlyData.push({
      month: `initial-${goalCreatedDate.toISOString().slice(0, 7)}`, // Make it unique
      monthDisplay: goalCreatedDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      year: goalCreatedDate.getFullYear(),
      pledgedAmount: goal.initial_amount,
      actualAmount: goal.initial_amount,
      status: 'initial',
      contributions: [],
      isInitialAmount: true
    });
  }
  
  // Generate monthly data from contribution start to target date
  const currentDate = new Date(contributionStartDate);
  currentDate.setDate(1); // Start of month
  
  while (currentDate <= targetDate) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based month index
    const monthKey = `monthly-${currentDate.toISOString().slice(0, 7)}`; // Make it unique and different from initial
    const monthDisplay = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Find contributions for this specific month using proper date comparison
    const monthContributions = contributions.filter(c => 
      isContributionInMonth(c.contribution_date, currentYear, currentMonth)
    );
    
    const actualAmount = monthContributions.reduce((sum, c) => 
      c.is_confirmed ? sum + c.amount : sum, 0
    );
    
    const hasUnconfirmed = monthContributions.some(c => !c.is_confirmed);
    
    let status: MonthlyData['status'];
    if (currentDate > today) {
      status = 'future';
    } else if (actualAmount > 0) {
      status = hasUnconfirmed ? 'pending' : 'confirmed';
    } else {
      status = 'missed';
    }
    
    monthlyData.push({
      month: monthKey,
      monthDisplay,
      year: currentYear,
      pledgedAmount: goal.monthly_pledge,
      actualAmount,
      status,
      contributions: monthContributions
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Group by year and sort chronologically
  const yearGroups = new Map<number, MonthlyData[]>();
  
  monthlyData.forEach(month => {
    if (!yearGroups.has(month.year)) {
      yearGroups.set(month.year, []);
    }
    yearGroups.get(month.year)!.push(month);
  });

  // Convert to array and sort by year ascending
  const sortedYearGroups: YearGroup[] = Array.from(yearGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, months]) => {
      // Sort months within year chronologically, ensuring initial deposit comes first
      const sortedMonths = months.sort((a, b) => {
        // Initial amount always comes first
        if (a.isInitialAmount && !b.isInitialAmount) return -1;
        if (!a.isInitialAmount && b.isInitialAmount) return 1;
        // Then sort by month key
        return a.month.localeCompare(b.month);
      });
      
      const totalPledged = sortedMonths.reduce((sum, m) => sum + m.pledgedAmount, 0);
      const totalActual = sortedMonths.reduce((sum, m) => sum + m.actualAmount, 0);
      
      return {
        year,
        months: sortedMonths,
        totalPledged,
        totalActual
      };
    });

  return sortedYearGroups;
};

export const getStatusIcon = (status: MonthlyData['status']) => {
  switch (status) {
    case 'initial':
      return '🏦';
    case 'confirmed':
      return '✅';
    case 'pending':
      return '⏳';
    case 'missed':
      return '❌';
    case 'future':
      return '📅';
    default:
      return '';
  }
};

export const getStatusColor = (status: MonthlyData['status']) => {
  switch (status) {
    case 'initial':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'missed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'future':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: MonthlyData['status']) => {
  switch (status) {
    case 'initial':
      return 'Initial Amount';
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'missed':
      return 'Missed';
    case 'future':
      return 'Upcoming';
    default:
      return 'Unknown';
  }
};
